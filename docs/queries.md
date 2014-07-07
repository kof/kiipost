## Remove old articles

    db.articles.remove({pubDate: {$lt: ISODate("2014-04-01T23:53:34Z")}})
