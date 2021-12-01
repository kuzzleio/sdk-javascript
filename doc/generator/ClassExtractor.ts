import { EventEmitter } from 'stream';

import { ClassDeclaration, JSDoc, Project, SyntaxKind } from 'ts-morph';

export type InfoMethod = {
  name: string;
  signature: string;
  description: string;
  args: InfoMethodArgs[];
  internal: boolean;
  returnType: string;
  returnTypeRaw: string;
  scope: 'public' | 'private' | 'protected';
}

export type InfoMethodArgs = {
  name: string;
  description: string;
  type: string;
  typeRaw: string;
  optional: boolean;
}

export type InfoClass = {
  name: string;
  description: string;
  internal: boolean;
  methods: InfoMethod[];
}

export class ClassExtractor extends EventEmitter {
  private filePath: string;

  public info: InfoClass;

  public methods: InfoMethod[] = [];

  constructor (filePath: string,) {
    super();

    this.filePath = filePath;
  }

  extract () {
    const project = new Project();

    for (const classDeclaration of project.addSourceFileAtPath(this.filePath).getClasses()) {
      this.extractClass(classDeclaration);
    }
  }

  private extractClass (classDeclaration: ClassDeclaration) {
    const name = classDeclaration.getName();

    const jsDoc = classDeclaration.getChildrenOfKind(SyntaxKind.JSDocComment)[0];

    const description = this.formatText(jsDoc.getComment());

    const internal =  Boolean(jsDoc.getTags().find(tag => tag.getTagName() === 'internal'));

    const methods = this.extractMethods(classDeclaration);

    this.info = { name, description, internal, methods };

    this.emit('class', this.info);
  }

  private extractMethods (classDeclaration: ClassDeclaration): InfoMethod[] {
    const methods: InfoMethod[] = [];

    for (const method of classDeclaration.getMethods()) {
      const jsDoc = method.getChildrenOfKind(SyntaxKind.JSDocComment)[0];

      if (! jsDoc) {
        continue;
      }

      const name = method.getName();

      const description = this.formatText(jsDoc.getComment());

      const args = this.getMethodArgs(jsDoc);

      const internal = Boolean(jsDoc.getTags().find(tag => tag.getTagName() === 'internal'));

      const scope = method.getScope();

      const returnTypeRaw = method.getReturnType().getText();
      const returnType = returnTypeRaw.replace(/import\(.*\)\./, '');
      const signature = `${scope === 'public' ? '' : `${scope} `}${name} (${args.map(arg => `${arg.name}${arg.optional ? '?' : ''}: ${arg.type}`).join(', ')}): ${returnType}`;

      const methodInfo = { name, signature, description, args, internal, scope, returnType, returnTypeRaw };

      methods.push(methodInfo);
    }

    return methods;
  }

  private getMethodArgs (jsDoc: JSDoc): InfoMethodArgs[] {
    const args: InfoMethodArgs[] = jsDoc.getTags()
      .filter(tag => tag.getTagName() === 'param')
      .map(tag => {
        const typeRaw = tag.getSymbol().getValueDeclaration().getType().getText();
        const type = typeRaw.replace(/import\(.*\)\./, '');

        return {
          name: tag.getSymbol().getEscapedName(),
          description: this.formatText(tag.getComment()),
          type,
          typeRaw,
          // If someone find better than this ugly hack I'm in!
          optional: Boolean(
               tag.getSymbol().getValueDeclaration()['_compilerNode']['questionToken']
            || tag.getSymbol().getValueDeclaration()['_compilerNode']['initalizer']),
        };
      });

    return args;
  }

  private formatText (text: any) {
    return text.replace('\n\n', '\n') as string;
  }
}