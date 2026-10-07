import { dag, Workspace, Directory, object, func } from "@dagger.io/dagger"

@object()
export class ZerotrustForumphp2026 {
  source: Directory

  constructor(ws: Workspace) {
    this.source = ws.directory("/", {
      exclude: ["**/node_modules", "**/.git", "**/dist", "**/.dagger"],
    })
  }

  /** Build the slide deck. publicPath sets the base path for served assets (e.g. "/repo-name/" on GitHub Pages). */
  @func()
  build(publicPath = "/"): Directory {
    const nodeModulesCache = dag.cacheVolume("node_modules")

    return dag
      .container()
      .from("node:22")
      .withWorkdir("/app")
      .withMountedDirectory("/app", this.source)
      .withMountedCache("/app/node_modules", nodeModulesCache)
      .withEnvVariable("PUBLIC_PATH", publicPath)
      .withExec(["yarn", "install", "--frozen-lockfile"])
      .withExec(["yarn", "build"])
      .directory("/app/dist")
  }
}
