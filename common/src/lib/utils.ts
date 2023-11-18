export const checkEnvVar = (...env_vars: string[]) => {
  let varsMissing: string[] = [];

  env_vars.forEach((v) => {
    if (!Object.keys(process.env).includes(v)) {
      varsMissing.push(`${v} must be defined`);
    }
  });

  return !!varsMissing.length ? varsMissing : null;
};
