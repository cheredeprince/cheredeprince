/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function (next) {
  // Générer le sitemap des maths
  Sitemap.initMath()
  // Ajouter la date aux logs
  require('console-stamp')(console, {pattern: 'dd/mm/yyyy HH:MM:ss.l'})
  next()
}
