export const ENV = process.env.NODE_ENV;

const envNames = {
    development: 'development',
    production: 'production',
};

const commonEnvVars = {};

const envVars = {
    [envNames.development]: {
        ...commonEnvVars,
    },
    [envNames.production]: {
        ...commonEnvVars,
    },
};

export const IS_DEV = ENV === envNames.development;
export const IS_PROD = ENV === envNames.production;

export const APP_CONFIGS = envVars[ENV || envNames.development];
