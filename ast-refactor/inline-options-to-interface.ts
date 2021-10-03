/**
 * Script to refactor inline options declaration into external interfaces
 * inheriting from the default "ArgsDefault" interface.
 * 
 * @example
 * 
export class SomeController {
  helloWorld (
    name: string,
    options: {
      queuable?: boolean,
      timeout?: number,
      age?: number;
    } = {}
  ): string {
    return name;
  }
}

 * This code will became 

export class SomeController {
  helloWorld (
    name: string,
    options: ArgsSomeControllerHelloWorld = {}
  ): string {
    return name;
  }
}

interface ArgsSomeControllerHelloWorld extends ArgsDefault {
  age?: number;
}

 */

/* Script Arguments ==================================================== */

const filePath = process.argv[2];
const className = process.argv[3];

if (! filePath || ! className) {
  console.log(`Usage: node ${process.argv[1]} <file path> <class name>`);
}

/* ===================================================================== */

import { Project, SyntaxKind, ParameterDeclaration } from 'ts-morph';

function upFirst (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// initialize
const project = new Project({});

const file = project.addSourceFileAtPath(filePath);
const loadedClass = file.getClassOrThrow(className);

for (const method of loadedClass.getMethods()) {
  if (method.getScope() !== 'public') {
    continue;
  }
  const options = method.getParameter('options');

  if (options) {
    const argsInterface = createArgsInterface(method.getName(), options);
    options.setType(argsInterface.getName())
  }
}


function createArgsInterface (methodName: string, options: ParameterDeclaration) {
  const argsInterface = file.addInterface({
    name: `Args${loadedClass.getName()}${upFirst(methodName)}`,
    extends: ['ArgsDefault'],
    isExported: true,
  });

  const optionsType = options.getTypeNode()

  if (optionsType) {
    const syntaxList = optionsType.getChildSyntaxList();

    for (const child of syntaxList.getChildren()) {
  
      const name = child.getChildrenOfKind(SyntaxKind.Identifier)[0].getText();
      // Ignore common arguments
      if (['queuable', 'timeout'].includes(name)) {
        continue;
      }
  
      const hasQuestionToken = Boolean(child.getChildrenOfKind(SyntaxKind.QuestionToken)[0]);
      const type = child.getChildrenOfKind(SyntaxKind.ColonToken)[0].getNextSibling().getText();
    
      argsInterface.addProperty({ name, type, hasQuestionToken });
    }  
  }

  console.log(argsInterface.getText());

  return argsInterface;
}



async function run () {
  await project.save();
}

run();