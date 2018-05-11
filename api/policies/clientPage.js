module.exports = function (req, res, next) {
  res.locals.leadInPage = 'salut les matheux'
  next()
}
