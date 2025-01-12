let WebpackDevServer = require('webpack-dev-server');
let webpack = require('webpack');
let config = require('./dev.config');
let shell = require('shelljs');

const host = process.env.HOST ? process.env.HOST : 'localhost';
const mainPort = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const devPort = process.env.PORT ? parseInt(process.env.PORT) + 1 : 3001;
const publicURL = process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '';

const options = {
    //contentBase: `http://${host}:${port}`,
    hot: true,
    historyApiFallback: true,
    //inline: true,
    //lazy: false,
    publicPath: config.output.publicPath,
    proxy: {
        '*': { target: `http://${host}:${devPort}` }
    },
    stats: {
        colors: true,
        chunks: false
    }
};

const compiler = webpack(config);
new WebpackDevServer(compiler, options).listen(mainPort, host, () => {
    shell.env.PORT = shell.env.PORT || mainPort;
    shell.exec(
        '"./node_modules/.bin/nodemon" start.js --max-http-header-size=81000 -e js,jsx',
        () => {}
    );
    console.log(
        'Webpack development server listening on http://%s:%s%s',
        host,
        mainPort,
        publicURL
    );
});
