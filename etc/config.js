var config = {};
config.web = {};
config.web.port = process.env.WEB_PORT || 8080;

config.server = {};
config.server.UTCHourDiff = 2;

const ENV_MAP = {
  dev: 'DEV',
  prod: 'PROD'
};

function pickEnv(env) {
  if (!env || !ENV_MAP[env]) {
    return ENV_MAP.dev;
  }
  return ENV_MAP[env];
}

config.server.env = pickEnv(process.env.NODE_ENV);

module.exports = config;
