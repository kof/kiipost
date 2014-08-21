## Remove old articles

    db.articles.remove({pubDate: {$lt: ISODate("2014-08-01T00:00:00Z")}})
