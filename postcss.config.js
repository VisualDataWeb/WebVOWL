module.exports = {
  plugins: [
    require('autoprefixer')({
        browsers: [
            "> 5%",
            "last 2 versions"
        ]
    })
  ]
};
