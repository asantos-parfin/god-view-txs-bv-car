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

export function JS_LOG_ALLOWED(){
  return process.env.NOLOG ? false : true
}