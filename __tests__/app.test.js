const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const request = require("supertest");
const app = require("../app");

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
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
});

describe("GET /api", () => {
  test("Returns with an object describing all the available endpoints", () => {
    const expectedObject = {
      "GET /api": {
        description:
          "serves up a json representation of all the available endpoints of the api",
      },
      "GET /api/topics": {
        description: "serves an array of all topics",
        queries: [],
        exampleResponse: {
          topics: [{ slug: "football", description: "Footie!" }],
        },
      },
      "GET /api/articles": {
        description: "serves an array of all articles",
        queries: ["author", "topic", "sort_by", "order"],
        exampleResponse: {
          articles: [
            {
              title: "Seafood substitutions are increasing",
              topic: "cooking",
              author: "weegembump",
              body: "Text from the article..",
              created_at: "2018-05-30T15:59:13.341Z",
              votes: 0,
              comment_count: 6,
            },
          ],
        },
      },
    };

    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        const apiEndpointsDescription = response.body.apiEndpointsDescription;
        expect(apiEndpointsDescription).toMatchObject(expectedObject);

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
    const expectedOutput = {
      article_id: 1,
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      created_at: "2020-07-09T20:11:00.000Z",
      votes: 100,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        const article = response.body.article;
        expect(article).toEqual(expectedOutput);
      });
  });
  test("STATUS 400: returns an error when passed non-existent but valid article_id", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(400)
      .then((response) => {
        const error = response.body;
        expect(error.msg).toBe("Bad request.");
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
