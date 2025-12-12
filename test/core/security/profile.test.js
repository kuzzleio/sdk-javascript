"use strict";

const { Profile } = require("../../../src/core/security/Profile");
const sinon = require("sinon");
const should = require("should");

describe("Profile", () => {
  let kuzzleMock;

  beforeEach(() => {
    kuzzleMock = {
      security: {
        mGetRoles: sinon.stub().resolves([
          { _id: "role1", controllers: ["foo", "bar"] },
          { _id: "role2", controllers: ["foo", "baz"] },
        ]),
      },
    };
  });

  describe("profile class", () => {
    it("should initialize a null profile with the correct default values", () => {
      const profile = new Profile(kuzzleMock);

      should(profile._id).be.null();
      should(profile.policies).be.Array().and.be.empty();
      should(profile.rateLimit).eql(0);
    });

    it("should initialize an empty profile with the correct default values", () => {
      const profile = new Profile(kuzzleMock, "foo", {});

      should(profile._id).eql("foo");
      should(profile.policies).be.Array().and.be.empty();
      should(profile.rateLimit).eql(0);
    });

    it("should initialize itself properly from a Kuzzle profile document", () => {
      const policies = [{ oh: "noes" }, { foo: "bar" }];
      const profile = new Profile(kuzzleMock, "foo", {
        policies,
        rateLimit: 123,
      });

      should(profile._id).eql("foo");
      should(profile.policies).eql(policies);
      should(profile.rateLimit).eql(123);
    });
  });

  describe("getRoles", () => {
    let profile;

    beforeEach(() => {
      profile = new Profile(kuzzleMock);
    });

    it("should return a Promise which resolves to an empty array if no profile is attached", () => {
      return profile.getRoles().then((roles) => {
        should(profile.kuzzle.security.mGetRoles).not.be.called();
        should(roles).be.an.Array().and.be.empty();
      });
    });

    it("should fetch the attached roles using the API to build Roles objects", () => {
      profile.policies = [
        { roleId: "role1", restrictions: ["i", "want", "to"] },
        { roleId: "role2", restrictions: ["break", "free"] },
      ];

      return profile.getRoles().then((roles) => {
        should(profile.kuzzle.security.mGetRoles)
          .be.calledOnce()
          .be.calledWith(["role1", "role2"]);

        should(roles).be.an.Array();
        should(roles[0]).match({ _id: "role1", controllers: ["foo", "bar"] });
        should(roles[1]).match({ _id: "role2", controllers: ["foo", "baz"] });
      });
    });
  });
});
