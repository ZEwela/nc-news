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

        expect(articles.length).toBe(13);

        articles.forEach((article) => {
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.title).toBe("string");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.author).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("string");
        });
      });
  });
  test("STATUS 200: returned array of articles is sorted by created_at in descending order by default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;

        expect(articles.length).toBe(13);
        expect(articles).toBeSorted({ key: "created_at", descending: true });
      });
  });
  test("STATUS 200: returned array of articles is sorted by provided sort_by query which sorts the articles by any valid column", () => {
    return request(app)
      .get("/api/articles?sort_by=title")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;

        expect(articles.length).toBe(13);
        expect(articles).toBeSorted({ key: "title", descending: true });
      });
  });
  test("STATUS 200: returned array of articles is ordered by provided order query", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;

        expect(articles.length).toBe(13);
        expect(articles).toBeSorted({ key: "created_at", descending: false });
      });
  });
  test("STATUS 200: returned array of articles is sorted by provided sort_by query and ordered by provided order query", () => {
    return request(app)
      .get("/api/articles?sort_by=author&order=asc")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;

        expect(articles.length).toBe(13);
        expect(articles).toBeSorted({ key: "author", descending: false });
      });
  });
  test("STATUS 200: returned array of articles is filtered by topic query", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;

        expect(articles.length).toBe(12);
      });
  });

  test("STATUS 200: returned array of articles is filtered by topic query sorted by created_at by default", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;

        expect(articles.length).toBe(12);
        expect(articles).toBeSorted({ key: "created_at", descending: true });
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
  test("STATUS 404: returns an error if provided topic does not exist in database", () => {
    return request(app)
      .get("/api/articles?topic=non-existent")
      .expect(404)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Not found.");
      });
  });
  test("STATUS 400: returns an error if provided sort_by is not valid", () => {
    return request(app)
      .get("/api/articles?sort_by=not-valid")
      .expect(400)
      .then((response) => {
        const error = response.body;

        expect(error.msg).toBe("Bad request.");
      });
  });
  test("STATUS 400: returns an error if provided order is not valid", () => {
    return request(app)
      .get("/api/articles?order=not-valid")
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

        expect(comments.length).toBe(11);
        comments.forEach((comment) => {
          expect(typeof comment.comment_id).toBe("number");
          expect(typeof comment.votes).toBe("number");
          expect(typeof comment.created_at).toBe("string");
          expect(typeof comment.author).toBe("string");
          expect(typeof comment.body).toBe("string");
          expect(typeof comment.article_id).toBe("number");
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

        expect(comments.length).toBe(11);
        expect(comments).toBeSorted({ key: "created_at", descending: true });
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

        expect(typeof comment.comment_id).toBe("number");
        expect(typeof comment.body).toBe("string");
        expect(typeof comment.article_id).toBe("number");
        expect(typeof comment.author).toBe("string");
        expect(typeof comment.votes).toBe("number");
        expect(typeof comment.created_at).toBe("string");
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
  test("STATUS 400: returns an error when request body do not contain all needed values", () => {
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
          expect(typeof user.username).toBe("string");
          expect(typeof user.name).toBe("string");
          expect(typeof user.avatar_url).toBe("string");
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

        expect(typeof user.username).toBe("string");
        expect(typeof user.name).toBe("string");
        expect(typeof user.avatar_url).toBe("string");
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
