Package.describe({
    name: 'hustle:ionic',
    version: '1.3.3',
    // Brief, one-line summary of the package.
    summary: '',
    // URL to the Git repository containing the source code for this package.
    git: '',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: ''
  });
  
  Package.onUse(function(api) {
    api.versionsFrom('1.3.3');
    // api.mainModule('ionic.js');
    api.addFiles([
      'js/ionic.js',
      'css/ionic.css',
    ], 'client');
      api.addAssets([
          'fonts/ionicons.eot',
          'fonts/ionicons.svg',
          'fonts/ionicons.ttf',
          'fonts/ionicons.woff'
    ], 'client');
  });
  
