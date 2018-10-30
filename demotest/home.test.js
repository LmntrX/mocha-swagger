const chai = require("chai");
const app = require("../bin/www");
describe("homepage", () => {
  it("welcomes the user", done => {
    chai
      .request(app)
      .get("/")
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});
