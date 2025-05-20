import * as fs from 'fs';
import * as readline from 'readline';

export function JS_JSON_TRANSFORMER_BIGINT(_: string, v: any) {
  return typeof v === "bigint" ? v.toString() : v;
}

export const JS_LOG_SAMELINE = (message: string) => {
  process.stdout.write('\r');
  process.stdout.write(message);
}

export function JS_INSPECT(data:any, depth=4, colors=true){
  return require('util').inspect(data, { depth: depth, colors: colors })
}

export function JS_SLEEP(ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function JS_ENV_READ(){
  const envFilePath = '.env';
  return fs.readFileSync(envFilePath, 'utf-8')
}

export function JS_ENV_UPDATE(key: string, value: string, forceQuotes: boolean = true): void {
  const envFilePath = '.env';
  const envVars = fs.readFileSync(envFilePath, 'utf-8').split('\n');

  const updatedEnvVars = envVars.map((line) => {
      const [k, ...vParts] = line.split('=');
      const v = vParts.join('=');

      if (k.trim() === key) {
      return `${k}=\"${value}\"`;
      }
      return line;
  });

  fs.writeFileSync(envFilePath, updatedEnvVars.join('\n'), 'utf-8');
}