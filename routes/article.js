const express = require("express");
const router = express.Router();
const Article = require("../models/article");
const checker = require("../tools/checker");
const multer = require("multer");
const moment = require("moment-jalaali");
const generalTools = require("../tools/general-tools");
const url = require("url");

//get new article page
router.get("/create", checker.loginChecker, (req, res) => {
  res.render("article/new-article", {
    user: req.session.user,
    msg: req.query.msg,
  });
});

//add new article
router.post("/create", (req, res) => {
  const upload = generalTools.uploadArticlePic.single("picture");

  upload(req, res, function (err) {
    //check article picture and describe is not empty
    if (!req.file || !req.body.describe)
      return res.redirect(
        url.format({
          pathname: "/article/create",
          query: {
            msg: "error",
          },
        })
      );
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ msg: "Server Error" });
    } else if (err) {
      res.status(406).send(err.message);
    } else {
      //create article object
      const newArticle = new Article({
        title: req.body.title,
        brief: req.body.brief,
        describe: req.body.describe,
        picture: req.file.filename,
        author: req.session.user._id,
      });
      //save new article to our database
      newArticle.save((err) => {
        if (err) return res.status(500).json({ msg: "Server Error" });
        return res.redirect(
          url.format({
            pathname: "/user/dashboard",
            query: {
              msg: "successfully",
            },
          })
        );
      });
    }
  });
});

//show user's article
router.get("/my/:username", checker.loginChecker, (req, res) => {
  let perPage = 6;
  let page = req.query.page || 1;
  //find all article's of this username

  Article.find({ author: req.session.user._id })
    .skip(perPage * page - perPage)
    .limit(perPage)
    .sort({ createdAt: -1 })
    .exec((err, articles) => {
      if (err) return res.status(500).json({ msg: "Server Error" });
      //change create date to jalaali datetime
      let createTime = [];
      for (let index = 0; index < articles.length; index++) {
        createTime[index] = {
          date: moment(articles[index].createdAt).format("jYYYY/jM/jD"),
          time: moment(articles[index].createdAt).format("HH:mm"),
        };
      }
      //find count of all articles
      Article.count().exec((err, count) => {
        if (err) return res.status(500).json({ msg: "Server Error" });
        res.render("article/my-articles", {
          user: req.session.user,
          page: req.query.page,
          articles,
          createTime,
          current: page,
          pages: Math.ceil(count / perPage),
        });
      });
    });
});

//show article in a single page
router.get("/view/:id", checker.loginChecker, (req, res) => {
  //find that article's requested
  Article.findOne({ _id: req.params.id })
    .populate("author", {
      _id: 0,
      firstName: 1,
      lastName: 1,
      avatar: 1,
    })
    .exec((err, article) => {
      if (err) return res.status(500).json({ msg: "Server Error" });
      Article.findByIdAndUpdate(
        req.params.id,
        { $inc: { viewCounter: 1 } },
        { new: true },
        (err, art) => {
          if (err) return res.status(500).json({ msg: "Server Error" });
          //change create date to jalaali datetime
          createTime = {
            date: moment(article.createdAt).format("jYYYY/jM/jD"),
            time: moment(article.createdAt).format("HH:mm"),
          };
          res.render("article/single-article", {
            user: req.session.user,
            article,
            createTime,
            art,
          });
        }
      );
    });
});

//get edit articles page
router.get("/edit", checker.loginChecker, (req, res) => {
  Article.find({ author: req.session.user._id }, (err, articles) => {
    if (err) return res.status(500).json({ msg: "Server Error" });
    return res
      .status(200)
      .render("article/edit-article", { articles, user: req.session.user });
  });
});

//delete article
router.get("/delete/:id", (req, res) => {
  console.log(req.params.id);
  Article.findByIdAndDelete(req.params.id, (err) => {
    if (err) return res.status(500).json({ msg: "Server Error" });
    return res.redirect(
      url.format({
        pathname: "/user/dashboard",
        query: {
          msg: "successfully deleted",
        },
      })
    );
  });
});

module.exports = router;
