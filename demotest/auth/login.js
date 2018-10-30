const chai = require("chai");
const chaiHttp = require("chai-http");
const Strings = require("../../src/utils/Strings");
const app = require("../../bin/www");
const user = require("../../src/models").user;
const TEST_EMAIL_ID = "mochatest@mail.com";
const TEST_PASSWORD = "testpass";
const ROUTE = "/auth/login";
chai.use(chaiHttp);
chai.should();
module.exports = () => {
  before(done => {
    chai
      .request(app)
      .post("/auth/signup")
      .send({
        email: TEST_EMAIL_ID,
        password: TEST_PASSWORD
      })
      .end(() => {
        done();
      });
  });
  it("Request without email id sends 400", done => {
    chai
      .request(app)
      .post(ROUTE)
      .send({
        password: TEST_PASSWORD
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.should.have.property("status");
        res.body.should.have.property("status").eql(400);
        res.body.should.have.property("error");
        res.body.should.have
          .property("error")
          .eql(Strings.ERROR_MESSAGES.EMAIL_AND_PASSWORD_REQUIRED);
        done();
      });
  });
  it("Incorrect credentials sends 401", done => {
    chai
      .request(app)
      .post(ROUTE)
      .send({
        email: TEST_EMAIL_ID,
        password: "incorrect password"
      })
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.be.a("object");
        res.body.should.have.property("status");
        res.body.should.have.property("status").eql(401);
        res.body.should.have.property("error");
        res.body.should.have
          .property("error")
          .eql(Strings.ERROR_MESSAGES.AUTH_FAILURE);
        done();
      });
  });
  it("Correct Request sends 200 and token", done => {
    chai
      .request(app)
      .post(ROUTE)
      .send({
        email: TEST_EMAIL_ID,
        password: TEST_PASSWORD
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("status");
        res.body.should.have.property("status").eql(200);
        res.body.should.have.property("data");
        res.body.should.have.property("data").property("access_token");
        done();
      });
  });
  after(() => {
    user.destroy({
      where: {
        email: [TEST_EMAIL_ID]
      }
    });
  });
};
