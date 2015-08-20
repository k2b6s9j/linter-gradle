"use babel";

export default {
  config: {

  },

  activate: () => {
    // Because Atom core does not include a Groovy grammar, and the Gradle build
    //  script is based in Groovy we ask the user to install a Groovy grammar
    //  and explain to them that they should do this to support the Gradle build
    //  script in the editor.
    // TODO: Remove this if a Groovy grammar is included in Core. (Very Unlikely though.)
    if(!atom.packages.getLoadedPackage("language-groovy")) {
      atom.notifications.addError(
        "Groovy Language Grammar not Installed.", {
          detail: "Because the Gradle Build Script is a Groovy DSL, please install the `language-groovy` package for a smoother experience with Gradle."
        }
      )
    }

    // Show the user an error if they do not have an appropriate linter base
    //  package installed from Atom Package Manager. This will not be an issues
    //  after a base linter package is integrated into Atom, in the comming
    //  months.
    // TODO: Remove when Linter Base is integrated into Atom.
    if(!atom.packages.getLoadedPackage("linter")) {
      atom.notifications.addError(
        "Linter Package not Installed.",
        {
          detail: "Please install the `linter` package in your Settings view."
        }
      );
    }
  },

  provideLinter: () => {
    const helpers = require("atom-linter");
    //const regex = "(?<file>.+):(?<line>\\d+):\\s(?<type>.+)[;:](?: (?<message>.+))?(?:[\\n\\R](?<trace>\\X+)\\s+\\^)";
    const regex = "(?<file>.+):(?<line>\\d+):\\s(?<type>.+)[;:](?: (?<message>.+))?";
    const regexFlags = "gmuUJ";
    const command = "gradle";
    const options = ["build"];
    return {
      grammarScopes: ["source.java", "source.scala", "source.groovy"],
      scope: "project",
      lintOnFly: false,
      lint: () => {
        for (path of atom.project.getPaths()) {
          if (helpers.findFile(path, ["build.gradle"])) {
            //console.log(`Gradle Build Script found in ${path}`);
            atom.notifications.addInfo("Gradle Build Started.");
            return helpers.exec(command, options, {cwd: path, stream: 'stderr'}).then(output => {
              console.log(output);
              const result = helpers.parse(output, regex);
              console.log(result);
              return result;
            })
          }
          else {
            console.log(`Gradle Build Script not found in ${path}`);
          }
        }
      }
    }
  }
}
