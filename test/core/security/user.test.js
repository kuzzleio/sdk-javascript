"use strict";

const { User } = require("../../../src/core/security/User"),
  sinon = require("sinon"),
  should = require("should");

describe("User", () => {
  let user;

  beforeEach(() => {
    user = new User({
      security: {
        mGetProfiles: sinon.stub().resolves([
          { _id: "profile1", policies: ["foo", "bar"] },
          { _id: "profile2", policies: ["foo", "baz"] },
        ]),
      },
    });
  });

  describe("getProfiles", () => {
    it("should return a Promise which resolves to an empty array if no profile is attached", () => {
      return user.getProfiles().then((profiles) => {
        should(user.kuzzle.security.mGetProfiles).not.be.called();
        should(profiles).be.an.Array().and.be.empty();
      });
    });

    it("should fetch the attached profiles using the API to build Profile objects", () => {
      user.content.profileIds = ["profile1", "profile2"];

      return user.getProfiles().then((profiles) => {
        should(user.kuzzle.security.mGetProfiles)
          .be.calledOnce()
          .be.calledWith(["profile1", "profile2"]);

        should(profiles).be.an.Array();
        should(profiles[0]).match({
          _id: "profile1",
          policies: ["foo", "bar"],
        });
        should(profiles[1]).match({
          _id: "profile2",
          policies: ["foo", "baz"],
        });
      });
    });
  });

  describe("#_source", () => {
    it("should return the user custom content", () => {
      user = new User({}, "foobar", { email: "foobar@goo.com" });

      should(user._source).be.eql({ email: "foobar@goo.com" });
    });

    it('should keep accessors to deprecated "content" getter', () => {
      user = new User({}, "foobar", { email: "foobar@goo.com" });

      should(user.content).be.eql({ email: "foobar@goo.com" });
    });
  });
});
