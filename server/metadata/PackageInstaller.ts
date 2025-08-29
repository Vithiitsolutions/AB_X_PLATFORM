import mercury from "@mercury-js/core";
import { execSync } from "child_process";
import { createRequire } from "module";

type Package = {
  id: string;
  name: string;
  version?: string;
  label: string;
};

export class PackageInstaller {
  packages: Package[] = [];

  isValidPackageName(name: string): boolean {
    if (!name || typeof name !== "string") {
      return false;
    }

    // Check for dangerous characters that could be used for command injection
    const dangerousChars = /[;&|`$(){}[\]<>'"\\]/;
    if (dangerousChars.test(name)) {
      return false;
    }

    // Check for dangerous command sequences
    const dangerousPatterns = [
      /&&/,
      /\|\|/,
      /;/,
      /\|/,
      /`/,
      /\$\(/,
      /\$\{/,
      /rm\s/,
      /del\s/,
      /rmdir\s/,
      /mv\s/,
      /cp\s/,
      /sudo\s/,
      /chmod\s/,
      /chown\s/,
      /kill\s/,
      /wget\s/,
      /curl\s/,
      /nc\s/,
      /netcat\s/,
      /\.\.\//,
      /\/etc\//,
      /\/bin\//,
      /\/usr\//,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(name)) {
        return false;
      }
    }

    // Validate against npm package naming rules
    const npmPackageRegex = /^(@[a-z0-9-._]+\/)?[a-z0-9-._]+$/i;
    if (!npmPackageRegex.test(name)) {
      return false;
    }

    // Additional length check (npm has a 214 character limit)
    if (name.length > 214) {
      return false;
    }

    return true;
  }

  async install(pkg: Package) {
    const require = createRequire(process.cwd() + "/");
    try {
      require.resolve(pkg.name);
    } catch {
      await this.executeProcess(`yarn add ${pkg.name}`);
    }
    this.packages.push({
      id: pkg.id,
      name: pkg.name,
      label: pkg.label,
      version: pkg.version,
    });
  }

  constructor() {}
  async init(): Promise<void> {
    const packages = await mercury.db.Package.list(
      {},
      { id: "", profile: "SystemAdmin" }
    );
    this.packages = packages;
  }
  isInstalled(packageId: string): boolean {
    return this.packages.some((pkg) => pkg.id === packageId);
  }
  async uninstall(id: string) {
    const pkg = this.packages.find((pkg) => pkg.id === id);
    if (!pkg) {
      throw new Error(`Package with id ${id} not found`);
    }

    await this.executeProcess(`yarn remove ${pkg.name}`);
    this.packages = this.packages.filter((pkg) => pkg.id !== id);
  }
  async initialInstall() {
    const require = createRequire(process.cwd() + "/");
    let installedPackagesString = this.packages
      .filter((pkg) => {
        try {
          require.resolve(pkg.name);
          return false;
        } catch {
          return true;
        }
      })
      .reduce((acc, pkg) => {
        return pkg.version
          ? acc + `${pkg.name}@${pkg.version} `
          : acc + `${pkg.name} `;
      }, "");

    if (installedPackagesString) {
      await this.executeProcess(`yarn add ${installedPackagesString}`);
    }
  }
  async executeProcess(cmd: string) {
    execSync(cmd, { cwd: process.cwd(), stdio: "inherit" });
    execSync("yarn patch-server", { cwd: process.cwd(), stdio: "inherit" });
  }
}
