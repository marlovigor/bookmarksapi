const express = require('express')
const { v4: uuid } = require('uuid');
const bookmarksRouter = express.Router()
const { isWebUri } = require('valid-url')
const bodyParser = express.json()
const logger = require('../logger')
// const bookmarks  = require('../store.js')
const {bookmarks} = require('../store')


bookmarksRouter
  .route('/store')
  .get((req, res) => {
    res
      .json(bookmarks);
  })
  .post(bodyParser, (req, res) => {

    const { title, url, description, rating } = req.body

    if (!Number.isInteger(rating) || rating < 0 || rating > 10) {
      logger.error(`Invalid rating '${rating}' supplied`)
      return res.status(400).send(`'rating' must be a number between 0 and 5`)
    }

    if (!isWebUri(url)) {
      logger.error(`Invalid url '${url}' supplied`)
      return res.status(400).send(`'url' must be a valid URL`)
    }


    const id = uuid();

    const bookmark = {
      id,
      title,
      url,
      description,
      rating
    }

    bookmarks.push(bookmark)

    logger.info(`Bookmark id ${bookmark.id} created`)
    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
      .json(bookmark)
  })

bookmarksRouter
  .route('/store/:id')
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find(c => c.id == id)

    // make sure we found a card
    if (!bookmark) {
      logger.error(`book with id ${id} not found.`);
      return res
        .status(404)
        .send('book Not Found');
    }

    res.json(bookmark);
  })
.delete((req, res) => {
  const { id } = req.params;

  const bookIndex = bookmarks.findIndex(c => c.id == id);

  if (bookIndex === -1) {
      logger.error(`Book with id ${id} not found.`);
      return res
          .status(404)
          .send('Not found');
  }

  bookmarks.splice(bookIndex, 1);

  logger.info(`book with id ${id} deleted.`);

  res
      .status(204)
      .send('book deleted')
      .end();
})

module.exports = bookmarksRouter