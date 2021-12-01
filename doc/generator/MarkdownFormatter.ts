import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';

import _ from 'lodash';

import { InfoClass, InfoMethod } from './ClassExtractor';

function upFirst (string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function kebabCase(string: string): string {
  return string
    // get all lowercase letters that are near to uppercase ones
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    // replace all spaces and low dash
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function contextualizeKeys (context: string, values: Record<string, any>) {
  const obj: Record<string, any> = {};

  for (const [key, value] of Object.entries(values)) {
    obj[`${context}${upFirst(key)}`] = value;
  }

  return obj;
}

export class MarkdownFormatter {
  private outputDir: string;
  private templateDir: string;
  private baseDir: string;

  constructor (outputDir: string, templateDir: string) {
    this.outputDir = outputDir;
    this.templateDir = templateDir;
  }

  onClass (classInfo: InfoClass) {
    if (classInfo.internal) {
      return;
    }

    this.baseDir = path.join(this.outputDir, kebabCase(classInfo.name));

    const rootIndex = this.renderTemplate(
      ['class', 'index.tpl.md'],
      contextualizeKeys('class', classInfo));

    this.writeFile(['index.md'], rootIndex);

    const introduction = this.renderTemplate(
      ['class', 'introduction', 'index.tpl.md'],
      contextualizeKeys('class', classInfo));

    this.writeFile(['introduction', 'index.md'], introduction);

    for (const method of classInfo.methods) {
      this.onMethod(classInfo, method);
    }
  }

  onMethod (classInfo: InfoClass, infoMethod: InfoMethod) {
    if (infoMethod.internal) {
      return;
    }

    const method = this.renderTemplate(
      ['class', 'method', 'index.tpl.md'],
      {
        ...contextualizeKeys('method', infoMethod),
        ...contextualizeKeys('class', classInfo),
      });

    this.writeFile([infoMethod.name, 'index.md'], method);
  }

  private writeFile (paths: string[], content: string) {
    const fullPath = path.join(this.baseDir, ...paths.map(p => kebabCase(p)));

    mkdirSync(path.dirname(fullPath), { recursive: true });

    writeFileSync(fullPath, content);
  }

  private renderTemplate (paths: string[], values: Record<string, any> = {}): string {
    const fullPath = path.join(this.templateDir, ...paths);

    const compiled = _.template(readFileSync(fullPath, { encoding: 'utf-8' }));

    return compiled(values);
  }
}
