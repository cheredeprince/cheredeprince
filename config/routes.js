/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

    'GET /': 'IndexController',

    'GET /blog/list': 'BlogController.list',
    'GET /blog/show': 'BlogController.show',
    'GET /blog/new': 'BlogController.new',
    'GET /blog/category/:id/page/:page': 'BlogController.category',
    'GET /blog/tag/:id/page/:page': 'BlogController.tag',
    'GET /blog/page/:page': 'BlogController.index',
    'GET /blog/:id': 'BlogController.show',

    'GET /math/elt/:id': 'MathController.elt',
    'GET /math/completion': 'MathController.completion',
    'GET /math/search': 'MathController.search',
    'GET /math/find': 'MathController.find',
    'GET /math/load': 'MathController.load',
    'GET /math/graph': 'MathController.graph',
    'GET /math/admin_data': 'MathController.admin_data',
    'GET /math/completion_tag': 'MathController.completion_tag',
    'GET /math/completion_mention': 'MathController.completion_mention',
    'GET /math/subscribe': 'MathController.subscribe',
    'GET /math/rss': 'MathController.rss',
    'GET /math/:id': 'MathController.index',


    'GET /images/blog/:name/:file': 'ImagesController.blog',
    'GET /images/blog/:name/b/:file': 'ImagesController.banner',
    'GET /images/blog/:name/s/:file': 'ImagesController.sticker',
    '/rss': '/rss/rss.xml',
    '/feed': '/rss/rss.xml',
    'GET /sitemap': 'SitemapController.index'


  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

};
