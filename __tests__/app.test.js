const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const request = require("supertest");
const app = require("../app");
const { toBeSorted } = require("jest-sorted");
const endpoints = require("../endpoints.json");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  db.end();
});

describe("GET /api/topics", () => {
  test("STATUS 200: returns an array of topic objects with correct properties", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const topics = response.body.topics;

        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("POST /api/topics", () => {
  test("STATUS 201: returns a new topic", () => {
    const body = {
      slug: "sun",
      description: "the ball of fire in the sky",
    };

    return request(app)
      .post("/api/topics")
      .send(body)
      .expect(201)
      .then((response) => {
        const topic = response.body.topic;

        expect(topic).toMatchObject({
          slug: expect.any(String),
          description: expect.any(String),
        });
      });
  });
  test("STATUS 201: returns a new topic and ignores unnecessary properties", () => {
    const body = {
      slug: "sun",
      description: "the ball of fire in the sky",
      toIgnore: "ignore me pls",
    };

    return request(app)
      .post("/api/topics")
      .send(body)
      .expect(201)
      .then((response) => {
        const topic = response.body.topic;

        expect(topic).not.toHaveProperty("toIgnore");
      });
  });
  test("STATUS 409: returns a correct message when topic with provided slug already exists in the database", () => {
    const body = {
      description: "The man, the Mitch, the legend",
      slug: "mitch",
    };

    return request(app)
      .post("/api/topics")
      .send(body)
      .expect(409)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Already exists.");
      });
  });
  test("STATUS 400: returns an error when the request body does not contain all the required values", () => {
    const body = {
      description: "the ball of fire in the sky",
    };

    return request(app)
      .post("/api/topics")
      .send(body)
      .expect(400)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Bad request.");
      });
  });
});

describe("GET /api/topics/:slug", () => {
  test("STATUS 200: returns a topic object specified by slug", () => {
    return request(app)
      .get("/api/topics/cats")
      .expect(200)
      .then((response) => {
        const topic = response.body.topic;

        expect(topic.slug).toBe("cats");
      });
  });
  test("STATUS 404: returns an error when passed non-existent slug ", () => {
    return request(app)
      .get("/api/topics/non-existent")
      .expect(404)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Not found.");
      });
  });
});

describe("GET /api", () => {
  test("Returns with an object describing all the available endpoints", () => {
    const expectedOutput = endpoints;

    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        const apiEndpointsDescription = response.body.apiEndpointsDescription;
        expect(apiEndpointsDescription).toMatchObject(expectedOutput);

        for (const apiEndpoint in apiEndpointsDescription) {
          expect(typeof apiEndpointsDescription[apiEndpoint].description).toBe(
            "string"
          );
          expect(
            Array.isArray(apiEndpointsDescription[apiEndpoint].queries)
          ).toBe(true);
          expect(
            typeof apiEndpointsDescription[apiEndpoint].exampleResponse
          ).toBe("object");
        }
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("STATUS 200: responds with a correct article object", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        const article = response.body.article;
        expect(article).toMatchObject({
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
          comment_count: expect.any(String),
        });
      });
  });
  test("STATUS 404: returns an error when passed non-existent but valid article_id", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then((response) => {
        const error = response.body;
        expect(error.msg).toBe("Not found.");
      });
  });
  test("STATUS 400: returns an error when passed invalid  article_id", () => {
    return request(app)
      .get("/api/articles/not-valid")
      .expect(400)
      .then((response) => {
        const error = response.body;
        expect(error.msg).toBe("Bad request.");
      });
  });
});

describe("GET /api/articles", () => {
  test("STATUS 200: responds with an array of articles with correct properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;

        articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(String),
          });
        });
      });
  });
  test("STATUS 200: returned array of articles is sorted by created_at in descending order by default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;

        expect(articles).toBeSorted({ key: "created_at", descending: true });
      });
  });
  test("STATUS 200: returned array of articles is sorted by provided sort_by query which sorts the articles by any valid column", () => {
    return request(app)
      .get("/api/articles?sort_by=title")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;

        expect(articles).toBeSorted({ key: "title", descending: true });
      });
  });
  test("STATUS 200: returned array of articles is ordered by provided order query", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;

        expect(articles).toBeSorted({ key: "created_at", descending: false });
      });
  });
  test("STATUS 200: returned array of articles is sorted by provided sort_by query and ordered by provided order query", () => {
    return request(app)
      .get("/api/articles?sort_by=author&order=asc")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;

        expect(articles).toBeSorted({ key: "author", descending: false });
      });
  });
  test("STATUS 200: returned array of articles is sorted by provided sort_by (comment_count) query and ordered by provided order query", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count&order=asc")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        expect(articles).toBeSorted({ key: "comment_count", coerce: true, descending: false });
      });
  });
  test("STATUS 200: returned array of articles is filtered by topic query and sorted by created_at by default", () => {
    const topic = "mitch";
    return request(app)
      .get(`/api/articles?topic=${topic}`)
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;

        expect(articles).toBeSorted({ key: "created_at", descending: true });

        articles.forEach((article) => {
          expect(article.topic).toBe(topic);
        });
      });
  });
  test("STATUS 200: returns an empty array if there are no articles with provided topic which exists in database", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;

        expect(articles.length).toBe(0);
      });
  });
  test("STATUS 200: returns an array of articles with a length limited by a 'limit' query", () => {
    return request(app)
      .get("/api/articles?limit=5")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;

        expect(articles.length).toBe(5);
      });
  });
  test("STATUS 200: returns an array of articles limited to a default length of 10", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;

        expect(articles.length).toBeLessThanOrEqual(10);
      });
  });
  test("STATUS 200: returns an array of articles from 'page' spacified by p query (sorted by article_id in ascending order for test purpose)", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id&order=asc&p=2")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;

        expect(articles[0].article_id).toBe(11);
      });
  });
  test("STATUS 200: returns an empty array if the provided 'p' query value refers to page that is bigger than accessible pages", () => {
    return request(app)
      .get("/api/articles?p=4")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        expect(articles.length).toBe(0);
      });
  });
  test("STATUS 200: returns an array of articles and a 'total_count' property reflecting the total number of articles excluding the pagination limit", () => {
    return request(app)
      .get("/api/articles?limit=1")
      .expect(200)
      .then((response) => {
        const { articles, total_count } = response.body;

        expect(total_count).not.toBe(articles.length);
      });
  });
  test("STATUS 200: returns an array of articles and a 'total_count' property reflecting the total number of articles after applying filters and excluding the pagination limit", () => {
    return request(app)
      .get("/api/articles?limit=1&topic=mitch")
      .expect(200)
      .then((response) => {
        const { articles, total_count } = response.body;

        expect(total_count).toBe(12);
      });
  });
  test("STATUS 400: returns a correct message if the provided 'limit' is not valid", () => {
    return request(app)
      .get("/api/articles?limit=not-valid")
      .expect(400)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Bad request.");
      });
  });
  test("STATUS 400: returns a correct message if the provided 'p' value is not valid", () => {
    return request(app)
      .get("/api/articles?p=not-valid")
      .expect(400)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Bad request.");
      });
  });
  test("STATUS 404: returns an error if the provided 'topic' does not exist in database", () => {
    return request(app)
      .get("/api/articles?topic=non-existent")
      .expect(404)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Not found.");
      });
  });
  test("STATUS 400: returns an error if the provided 'sort_by' is not valid", () => {
    return request(app)
      .get("/api/articles?sort_by=not-valid")
      .expect(400)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Bad request.");
      });
  });
  test("STATUS 400: returns an error if the provided 'order' is not valid", () => {
    return request(app)
      .get("/api/articles?order=not-valid")
      .expect(400)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Bad request.");
      });
  });
});

describe("POST /api/articles", () => {
  test("STATUS 201: returns a new article", () => {
    const body = {
      author: "butter_bridge",
      title: "new title",
      body: "new body",
      topic: "cats",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };

    return request(app)
      .post("/api/articles")
      .send(body)
      .expect(201)
      .then((response) => {
        const article = response.body.article;

        expect(article).toMatchObject({
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
          comment_count: expect.any(String),
        });
      });
  });
  test("STATUS 201: returns a new article with article_img_url property set by default if not provided in the request body", () => {
    const body = {
      author: "butter_bridge",
      title: "new title",
      body: "new body",
      topic: "cats",
    };

    return request(app)
      .post("/api/articles")
      .send(body)
      .expect(201)
      .then((response) => {
        const article = response.body.article;

        expect(article).toHaveProperty("article_img_url");
      });
  });
  test("STATUS 201: returns a new article and ignores unnecessary properties", () => {
    const body = {
      author: "butter_bridge",
      title: "new title",
      body: "new body",
      topic: "cats",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      toIgnore: "ignore me pls",
    };

    return request(app)
      .post("/api/articles")
      .send(body)
      .expect(201)
      .then((response) => {
        const article = response.body.article;

        expect(article).not.toHaveProperty("toIgnore");
      });
  });
  test("STATUS 404: returns a message Not Found when topic does not exist in database", () => {
    const body = {
      author: "butter_bridge",
      title: "new title",
      body: "new body",
      topic: "not-exist",
    };

    return request(app)
      .post("/api/articles")
      .send(body)
      .expect(404)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Not found.");
      });
  });
  test("STATUS 404: returns a message Not Found when author does not exist in database", () => {
    const body = {
      author: "not-exist",
      title: "new title",
      body: "new body",
      topic: "cats",
    };

    return request(app)
      .post("/api/articles")
      .send(body)
      .expect(404)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Not found.");
      });
  });
  test("STATUS 400: returns an error when the request body does not contain all the required values", () => {
    const body = {
      author: "butter_bridge",
      title: "new title",
      topic: "cats",
    };

    return request(app)
      .post("/api/articles")
      .send(body)
      .expect(400)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Bad request.");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("STATUS 200: returns an array of comments with correct properties", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        const comments = response.body.comments;

        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
        });
      });
  });
  test("STATUS 200: returns an empty array when article do not have any comments", () => {
    return request(app)
      .get("/api/articles/8/comments")
      .expect(200)
      .then((response) => {
        const comments = response.body.comments;

        expect(comments.length).toBe(0);
      });
  });
  test("STATUS 200: returned array is sorted by created_at in descending order by default", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        const comments = response.body.comments;

        expect(comments).toBeSorted({ key: "created_at", descending: true });
      });
  });
  test("STATUS 200: returns an array of comments with a length limited by a 'limit' query", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5")
      .expect(200)
      .then((response) => {
        const comments = response.body.comments;

        expect(comments.length).toBe(5);
      });
  });
  test("STATUS 200: returns an array of comments limited to a default length of 10", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        const comments = response.body.comments;

        expect(comments.length).toBeLessThanOrEqual(10);
      });
  });
  test("STATUS 200: returns an array of comments from 'page' spacified by p query", () => {
    return request(app)
      .get("/api/articles/1/comments?p=2")
      .expect(200)
      .then((response) => {
        const comments = response.body.comments;

        expect(comments.length).toBe(1);
      });
  });
  test("STATUS 200: returns an empty array if the provided 'p' query value refers to page that is bigger than accessible pages", () => {
    return request(app)
      .get("/api/articles/1/comments?p=3")
      .expect(200)
      .then((response) => {
        const comments = response.body.comments;

        expect(comments.length).toBe(0);
      });
  });
  test("STATUS 400: returns a correct message if the provided 'limit' value is not valid", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=not-valid")
      .expect(400)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Bad request.");
      });
  });
  test("STATUS 400: returns a correct message if the provided 'p' value is not valid", () => {
    return request(app)
      .get("/api/articles/1/comments?p=not-valid")
      .expect(400)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Bad request.");
      });
  });
  test("STATUS 404: returns an error when passed non-existent but valid article_id", () => {
    return request(app)
      .get("/api/articles/9999/comments")
      .expect(404)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Not found.");
      });
  });
  test("STATUS 400: returns an error when passed invalid article_id", () => {
    return request(app)
      .get("/api/articles/not-valid/comments")
      .expect(400)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Bad request.");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("STATUS 201: returns a new comment", () => {
    const body = {
      body: "A new comment!",
      username: "butter_bridge",
    };

    return request(app)
      .post("/api/articles/2/comments")
      .send(body)
      .expect(201)
      .then((response) => {
        const comment = response.body.comment;

        expect(comment).toMatchObject({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          article_id: expect.any(Number),
        });
      });
  });
  test("STATUS 201: returns a new comment and ignores unnecessary properties", () => {
    const body = {
      body: "A new comment!",
      username: "butter_bridge",
      toIgnore: "ignore me pls",
    };

    return request(app)
      .post("/api/articles/2/comments")
      .send(body)
      .expect(201)
      .then((response) => {
        const comment = response.body.comment;

        expect(comment).not.toHaveProperty("toIgnore");
      });
  });
  test("STATUS 404: returns a message Not Found when username does not exist in database", () => {
    const body = {
      body: "A new comment!",
      username: "do-not-exist",
    };

    return request(app)
      .post("/api/articles/1/comments")
      .send(body)
      .expect(404)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Not found.");
      });
  });
  test("STATUS 404: returns an error when passed non-existent but valid article_id", () => {
    const body = {
      body: "A new comment!",
      username: "butter_bridge",
    };

    return request(app)
      .post("/api/articles/9999/comments")
      .send(body)
      .expect(404)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Not found.");
      });
  });
  test("STATUS 400: returns an error when passed invalid article_id", () => {
    const body = {
      body: "A new comment!",
      username: "butter_bridge",
    };

    return request(app)
      .post("/api/articles/not-valid/comments")
      .send(body)
      .expect(400)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Bad request.");
      });
  });
  test("STATUS 400: Returns an error when the request body does not contain all the required values", () => {
    const body = {
      body: "A new comment!",
    };

    return request(app)
      .post("/api/articles/2/comments")
      .send(body)
      .expect(400)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Bad request.");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("STATUS 200: returns an updated article specified by article_id (increment votes by provided inc_votes in the body of request)", () => {
    const newVote = 1;
    const body = { inc_votes: newVote };

    return request(app)
      .patch("/api/articles/4")
      .send(body)
      .expect(200)
      .then((response) => {
        const article = response.body.article;
        expect(article.votes).toBe(1);
      });
  });
  test("STATUS 200: returns an updated article specified by article_id (decrement votes by provided inc_votes in the body of request)", () => {
    const newVote = -100;
    const body = { inc_votes: newVote };

    return request(app)
      .patch("/api/articles/4")
      .send(body)
      .expect(200)
      .then((response) => {
        const article = response.body.article;
        expect(article.votes).toBe(-100);
      });
  });
  test("STATUS 200: returns an updated article specified by article_id (changes votes by provided inc_votes in the body of request - multiple operations)", () => {
    const newVote = -100;
    const body = { inc_votes: newVote };

    request(app)
      .patch("/api/articles/4")
      .send(body)
      .expect(200)
      .then((response) => {
        const article = response.body.article;
        expect(article.votes).toBe(-100);
      });

    const newVote2 = 99;
    const body2 = { inc_votes: newVote2 };

    return request(app)
      .patch("/api/articles/4")
      .send(body2)
      .expect(200)
      .then((response) => {
        const article = response.body.article;
        expect(article.votes).toBe(-1);
      });
  });
  test("STATUS 404: returns an error when passed non-existent but valid article_id", () => {
    const newVote = -100;
    const body = { inc_votes: newVote };

    return request(app)
      .patch("/api/articles/9999")
      .send(body)
      .expect(404)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Not found.");
      });
  });
  test("STATUS 400: returns an error when passed invalid article_id", () => {
    const newVote = -100;
    const body = { inc_votes: newVote };

    return request(app)
      .patch("/api/articles/not-valid")
      .send(body)
      .expect(400)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Bad request.");
      });
  });
  test("STATUS 400: returns an error when request body does not contain needed value", () => {
    const body = {};

    return request(app)
      .patch("/api/articles/2")
      .send(body)
      .expect(400)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Bad request.");
      });
  });
  test("STATUS 400: returns an error when the request body contains a value of the wrong type", () => {
    const newVote = "abc";
    const body = { inc_votes: newVote };

    return request(app)
      .patch("/api/articles/2")
      .send(body)
      .expect(400)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Bad request.");
      });
  });
});

describe("DELETE /api/articles/:article_id", () => {
  test("STATUS 204: returns correct status after deleting an article", () => {
    return request(app).delete("/api/articles/2").expect(204);
  });
  test("STATUS 204: deletes the article and its comments", () => {
    let commentsLengthBeforeDeleting = null;
    return request(app)
      .get("/api/comments")
      .expect(200)
      .then((response) => {
        const comments = response.body.comments;
        commentsLengthBeforeDeleting = comments.length;
        return request(app).delete("/api/articles/1").expect(204);
      })
      .then(() => {
        return request(app).get("/api/comments").expect(200);
      })
      .then((response) => {
        const comments = response.body.comments;
        expect(comments.length).toBeLessThan(commentsLengthBeforeDeleting);
      });
  });
  test("STATUS 404: returns an error when passed non-existent but valid article_id", () => {
    return request(app)
      .delete("/api/articles/9999")
      .expect(404)
      .then((response) => {
        const error = response.body;
        expect(error.msg).toBe("Not found.");
      });
  });
  test("STATUS 400: returns an error when passed invalid  article_id", () => {
    return request(app)
      .delete("/api/articles/not-valid")
      .expect(400)
      .then((response) => {
        const error = response.body;
        expect(error.msg).toBe("Bad request.");
      });
  });
});

describe("GET /api/comments", () => {
  test("STATUS 200: returns an array of comments with correct properties", () => {
    return request(app)
      .get("/api/comments")
      .expect(200)
      .then((response) => {
        const comments = response.body.comments;

        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
        });
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("STATUS 204: returns correct status after deleting a comment", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });
  test("STATUS 404: returns an error when passed non-existent but valid comment_id", () => {
    return request(app)
      .delete("/api/comments/9999")
      .expect(404)
      .then((response) => {
        const error = response.body;
        expect(error.msg).toBe("Not found.");
      });
  });
  test("STATUS 400: returns an error when passed invalid  comment_id", () => {
    return request(app)
      .delete("/api/comments/not-valid")
      .expect(400)
      .then((response) => {
        const error = response.body;
        expect(error.msg).toBe("Bad request.");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("STATUS 200: returns an updated comment specified by comment_id (increment votes by provided inc_votes in the body of request)", () => {
    const newVote = 1;
    const body = { inc_votes: newVote };

    return request(app)
      .patch("/api/comments/5")
      .send(body)
      .expect(200)
      .then((response) => {
        const comment = response.body.comment;
        expect(comment.votes).toBe(1);
      });
  });
  test("STATUS 200: returns an updated comment specified by comment_id (decrement votes by provided inc_votes in the body of request)", () => {
    const newVote = -1;
    const body = { inc_votes: newVote };

    return request(app)
      .patch("/api/comments/5")
      .send(body)
      .expect(200)
      .then((response) => {
        const comment = response.body.comment;
        expect(comment.votes).toBe(-1);
      });
  });
  test("STATUS 200: returns an updated comment specified by comment_id (changes votes by provided inc_votes in the body of request - multiple operations)", () => {
    const newVote = -1;
    const body = { inc_votes: newVote };

    request(app)
      .patch("/api/comments/5")
      .send(body)
      .expect(200)
      .then((response) => {
        const comment = response.body.comment;
        expect(comment.votes).toBe(-1);
      });

    const newVote2 = 1;
    const body2 = { inc_votes: newVote2 };

    return request(app)
      .patch("/api/comments/5")
      .send(body2)
      .expect(200)
      .then((response) => {
        const comment = response.body.comment;
        expect(comment.votes).toBe(0);
      });
  });
  test("STATUS 404: returns an error when passed non-existent but valid comment_id", () => {
    const newVote = -1;
    const body = { inc_votes: newVote };

    return request(app)
      .patch("/api/comments/9999")
      .send(body)
      .expect(404)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Not found.");
      });
  });
  test("STATUS 400: returns an error when passed invalid comment_id", () => {
    const newVote = -1;
    const body = { inc_votes: newVote };

    return request(app)
      .patch("/api/comments/not-valid")
      .send(body)
      .expect(400)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Bad request.");
      });
  });
  test("STATUS 400: returns an error when request body does not contain needed value", () => {
    const body = {};

    return request(app)
      .patch("/api/comments/5")
      .send(body)
      .expect(400)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Bad request.");
      });
  });
  test("STATUS 400: returns an error when the request body contains a value of the wrong type", () => {
    const newVote = "abc";
    const body = { inc_votes: newVote };

    return request(app)
      .patch("/api/comments/5")
      .send(body)
      .expect(400)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Bad request.");
      });
  });
});

describe("GET /api/users", () => {
  test("STATUS 200: returns an array of users with correct properties", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        const users = response.body.users;

        expect(users.length).toBe(4);
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/users/:username", () => {
  test("STATUS 200: returns an user object with correct properties", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then((response) => {
        const user = response.body.user;

        expect(user).toMatchObject({
          username: expect.any(String),
          name: expect.any(String),
          avatar_url: expect.any(String),
        });
      });
  });
  test("STATUS 404: returns a Not found message when provided username does not exist in database", () => {
    return request(app)
      .get("/api/users/not-exist")
      .expect(404)
      .then((response) => {
        const error = response.body;
        expect(error.msg).toBe("Not found.");
      });
  });
});

describe("path not found", () => {
  test("returns 404 for path that doesn't exist", () => {
    return request(app)
      .get("/api/not-exists")
      .expect(404)
      .then((response) => {
        const error = response.body;
        expect(error.msg).toBe("Path not found.");
      });
  });
});
