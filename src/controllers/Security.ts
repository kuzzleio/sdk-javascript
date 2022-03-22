import { BaseController } from './Base';
import { Role } from '../core/security/Role';
import { RoleSearchResult } from '../core/searchResult/Role';
import { Profile } from '../core/security/Profile';
import { ProfileSearchResult } from '../core/searchResult/Profile';
import { User } from '../core/security/User';
import { UserSearchResult } from '../core/searchResult/User';
import { ArgsDefault } from '../types';

export class SecurityController extends BaseController {
  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    super(kuzzle, 'security');
  }

  /**
   * Creates a new API key for a user.
   *
   * @param {String} userId - User kuid
   * @param {String} description - API key description
   * @param {Object} [options] - { _id, expiresIn, refresh }
   *
   * @returns {Promise.<Object>} ApiKey { _id, _source }
   */
  createApiKey(
    userId,
    description,
    options: ArgsSecurityControllerCreateApiKey = {}) {
    const request = {
      userId,
      action: 'createApiKey',
      _id: options._id,
      expiresIn: options.expiresIn,
      refresh: options.refresh,
      body: {
        description
      }
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  /**
   * Checks if an API action can be executed by a user
   *
   * @param {String} kuid - User kuid
   * @param {Object} requestPayload - Request to check
   */
  checkRights (kuid, requestPayload, options: ArgsSecurityControllerCheckRights) {
    const request = {
      userId: kuid,
      body: requestPayload,
      action: 'checkRights'
    };

    return this.query(request, options)
      .then(response => response.result.allowed);
  }

  /**
   * Deletes an user API key.
   *
   * @param {String} userId - User kuid
   * @param {String} id - API key ID
   * @param {Object} [options] - { refresh }
   *
   * @returns {Promise}
   */
  deleteApiKey(
    userId,
    id,
    options: ArgsSecurityControllerDeleteApiKey = {}) {
    const request = {
      userId,
      action: 'deleteApiKey',
      _id: id,
      refresh: options.refresh
    };

    return this.query(request, options);
  }

  /**
   * Searches for a user API key.
   *
   * @param {String} userId - User kuid
   * @param {Object} [query] - Search query
   * @param {Object} [options] - { from, size }
   *
   * @returns {Promise.<object[]>} - { hits, total }
   */
  searchApiKeys(
    userId,
    query = {},
    options: ArgsSecurityControllerSearchApiKeys = {}
  ) {
    const request = {
      userId,
      action: 'searchApiKeys',
      from: options.from,
      size: options.size,
      lang: options.lang,
      body: query
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  createCredentials (strategy, _id, body, options: ArgsSecurityControllerCreateCredentials = {}) {
    return this.query({
      _id,
      strategy,
      body,
      action: 'createCredentials'
    }, options)
      .then(response => response.result);
  }

  createFirstAdmin (
    _id,
    body,
    options: ArgsSecurityControllerCreateFirstAdmin = {}
  ) {
    const request = {
      _id,
      body,
      action: 'createFirstAdmin',
      reset: options.reset
    };

    return this.query(request, options)
      .then(response => new User(this.kuzzle, response.result._id, response.result._source));
  }

  createOrReplaceProfile (_id, body, options: ArgsSecurityControllerCreateOrReplaceProfile = {}) {
    const request = {
      _id,
      body,
      action: 'createOrReplaceProfile'
    };

    return this.query(request, options)
      .then(response => new Profile(
        this.kuzzle,
        response.result._id,
        response.result._source));
  }

  createOrReplaceRole (
    _id,
    body,
    options: ArgsSecurityControllerCreateOrReplaceRole = {}
  ) {
    const request = {
      _id,
      body,
      action: 'createOrReplaceRole',
      force: options.force ? true : null
    };
    return this.query(request, options)
      .then(response => new Role(this.kuzzle, response.result._id, response.result._source.controllers));
  }

  createProfile (_id, body, options: ArgsSecurityControllerCreateProfile = {}) {
    const request = {
      _id,
      body,
      action: 'createProfile'
    };

    return this.query(request, options)
      .then(response => new Profile(
        this.kuzzle,
        response.result._id,
        response.result._source));
  }

  createRestrictedUser (body, _id = null, options: ArgsSecurityControllerCreateRestrictedUser = {}) {
    if (!body.content) {
      body.content = {};
    }

    const request = {
      _id,
      body,
      action: 'createRestrictedUser'
    };

    return this.query(request, options)
      .then(response => new User(this.kuzzle, response.result._id, response.result._source));
  }

  createRole (_id, body, options: ArgsSecurityControllerCreateRole = {}) {
    const request = {
      _id,
      body,
      action: 'createRole',
      force: options.force ? true : null
    };
    return this.query(request, options)
      .then(response => new Role(this.kuzzle, response.result._id, response.result._source.controllers));
  }

  createUser (_id, body, options: ArgsSecurityControllerCreateUser = {}) {
    const request = {
      _id,
      body,
      action: 'createUser'
    };

    return this.query(request, options)
      .then(response => new User(this.kuzzle, response.result._id, response.result._source));
  }

  deleteCredentials (strategy, _id, options: ArgsSecurityControllerDeleteCredentials = {}) {
    const request = {
      strategy,
      _id,
      action: 'deleteCredentials'
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  deleteProfile (_id, options: ArgsSecurityControllerDeleteProfile = {}) {
    const request = {
      _id,
      action: 'deleteProfile'
    };
    return this.query(request, options)
      .then(response => response.result);
  }

  deleteRole (_id, options: ArgsSecurityControllerDeleteRole = {}) {
    const request = {
      _id,
      action: 'deleteRole'
    };
    return this.query(request, options)
      .then(response => response.result);
  }

  deleteUser (_id, options: ArgsSecurityControllerDeleteUser = {}) {
    const request = {
      _id,
      action: 'deleteUser'
    };
    return this.query(request, options)
      .then(response => response.result);
  }

  getAllCredentialFields (options: ArgsSecurityControllerGetAllCredentialFields = {}) {
    return this.query({
      action: 'getAllCredentialFields'
    }, options)
      .then(response => response.result);
  }

  getCredentialFields (strategy, options: ArgsSecurityControllerGetCredentialFields = {}) {
    return this.query({
      strategy,
      action: 'getCredentialFields'
    }, options)
      .then(response => response.result);
  }

  getCredentials (strategy, _id, options: ArgsSecurityControllerGetCredentials = {}) {
    return this.query({
      strategy,
      _id,
      action: 'getCredentials'
    }, options)
      .then(response => response.result);
  }

  getCredentialsById (strategy, _id, options: ArgsSecurityControllerGetCredentialsById = {}) {
    return this.query({
      strategy,
      _id,
      action: 'getCredentialsById'
    }, options)
      .then(response => response.result);
  }

  getProfile (_id, options: ArgsSecurityControllerGetProfile = {}) {
    return this.query({_id, action: 'getProfile'}, options)
      .then(response => new Profile(
        this.kuzzle,
        response.result._id,
        response.result._source));
  }

  getProfileMapping (options: ArgsSecurityControllerGetProfileMapping = {}) {
    return this.query({
      action: 'getProfileMapping'
    }, options)
      .then(response => response.result);
  }

  getProfileRights (_id, options: ArgsSecurityControllerGetProfileRights = {}) {
    return this.query({
      _id,
      action: 'getProfileRights'
    }, options)
      .then(response => response.result.hits);
  }

  getRole (_id, options: ArgsSecurityControllerGetRole = {}) {
    return this.query({
      _id,
      action: 'getRole'
    }, options)
      .then(response => new Role(this.kuzzle, response.result._id, response.result._source.controllers));
  }

  getRoleMapping (options: ArgsSecurityControllerGetRoleMapping = {}) {
    return this.query({
      action: 'getRoleMapping'
    }, options)
      .then(response => response.result);
  }

  getUser (_id, options: ArgsSecurityControllerGetUser = {}) {
    return this.query({
      _id,
      action: 'getUser'
    }, options)
      .then(response => new User(this.kuzzle, response.result._id, response.result._source));
  }

  getUserMapping (options: ArgsSecurityControllerGetUserMapping = {}) {
    return this.query({
      action: 'getUserMapping'
    }, options)
      .then(response => response.result);
  }

  getUserRights (_id, options: ArgsSecurityControllerGetUserRights = {}) {
    return this.query({
      _id,
      action: 'getUserRights'
    }, options)
      .then(response => response.result.hits);
  }

  getUserStrategies (_id, options: ArgsSecurityControllerGetUserStrategies = {}) {
    return this.query({
      _id,
      action: 'getUserStrategies'
    }, options)
      .then(response => response.result.strategies);
  }

  hasCredentials (strategy, _id, options: ArgsSecurityControllerHasCredentials = {}) {
    return this.query({
      strategy,
      _id,
      action: 'hasCredentials'
    }, options)
      .then(response => response.result);
  }

  mDeleteProfiles (ids, options: ArgsSecurityControllerMDeleteProfiles = {}) {
    const request = {
      action: 'mDeleteProfiles',
      body: {ids}
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  mDeleteRoles (ids, options: ArgsSecurityControllerMDeleteRoles = {}) {
    const request = {
      action: 'mDeleteRoles',
      body: {ids}
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  mDeleteUsers (ids, options: ArgsSecurityControllerMDeleteUsers = {}) {
    const request = {
      action: 'mDeleteUsers',
      body: {ids}
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  mGetProfiles (ids, options: ArgsSecurityControllerMGetProfiles = {}) {
    return this.query({action: 'mGetProfiles', body: {ids}}, options)
      .then(response => response.result.hits.map(
        hit => new Profile(this.kuzzle, hit._id, hit._source)));
  }

  mGetUsers (ids, options: ArgsSecurityControllerMGetUsers = {}) {
    const request = {
      action: 'mGetUsers',
      body: {ids}
    };

    return this.query(request, options)
      .then(response => response.result.hits.map(hit => new User(this.kuzzle, hit._id, hit._source)));
  }

  mGetRoles (ids, options: ArgsSecurityControllerMGetRoles = {}) {
    return this.query({
      action: 'mGetRoles',
      body: {ids}
    }, options)
      .then(response => response.result.hits.map(hit => new Role(this.kuzzle, hit._id, hit._source.controllers)));
  }

  refresh(collection) {
    return this.query({
      collection,
      action: 'refresh'
    });
  }

  replaceUser (_id, body, options: ArgsSecurityControllerReplaceUser = {}) {
    const request = {
      _id,
      body,
      action: 'replaceUser'
    };
    return this.query(request, options)
      .then(response => new User(this.kuzzle, response.result._id, response.result._source));
  }

  searchProfiles (body, options: ArgsSecurityControllerSearchProfiles= {}) {
    const request = {
      body,
      action: 'searchProfiles'
    };
    for (const [key, value] of Object.entries(options)) {
      request[key] = value;
    }

    return this.query(request, options)
      .then(response => new ProfileSearchResult(this.kuzzle, request, options, response.result));
  }

  searchRoles (body, options: ArgsSecurityControllerSearchRoles = {}) {
    const request = {
      body,
      action: 'searchRoles'
    };
    for (const [key, value] of Object.entries(options)) {
      request[key] = value;
    }

    return this.query(request, options)
      .then(response => new RoleSearchResult(this.kuzzle, request, options, response.result));
  }

  searchUsers (body, options: ArgsSecurityControllerSearchUsers = {}) {
    const request = {
      body,
      action: 'searchUsers'
    };
    for (const opt of ['from', 'size', 'scroll', 'lang']) {
      request[opt] = options[opt];
    }

    return this.query(request, options)
      .then(response => new UserSearchResult(this.kuzzle, request, options, response.result));
  }

  updateCredentials (strategy, _id, body, options: ArgsSecurityControllerUpdateCredentials = {}) {
    return this.query({
      strategy,
      _id,
      body,
      action: 'updateCredentials'
    }, options)
      .then(response => response.result);
  }

  updateProfile (_id, body, options: ArgsSecurityControllerUpdateProfile = {}) {
    const request = {
      _id,
      body,
      action: 'updateProfile'
    };

    return this.query(request, options)
      .then(response => new Profile(
        this.kuzzle,
        response.result._id,
        response.result._source));
  }

  updateProfileMapping (body, options: ArgsSecurityControllerUpdateProfileMapping = {}) {
    return this.query({
      body,
      action: 'updateProfileMapping'
    }, options)
      .then(response => response.result);
  }

  updateRole (_id, body, options: ArgsSecurityControllerUpdateRole = {}) {
    const request = {
      _id,
      body,
      action: 'updateRole',
      force: options.force ? true : null
    };

    return this.query(request, options)
      .then(response => new Role(this.kuzzle, response.result._id, response.result._source.controllers));
  }

  updateRoleMapping (body, options: ArgsSecurityControllerUpdateRoleMapping = {}) {
    return this.query({
      body,
      action: 'updateRoleMapping'
    }, options)
      .then(response => response.result);
  }

  updateUser (_id, body, options: ArgsSecurityControllerUpdateUser = {}) {
    const request = {
      _id,
      body,
      action: 'updateUser'
    };
    return this.query(request, options)
      .then(response => new User(this.kuzzle, response.result._id, response.result._source));
  }

  updateUserMapping (body, options: ArgsSecurityControllerUpdateUserMapping = {}) {
    return this.query({
      body,
      action: 'updateUserMapping'
    }, options)
      .then(response => response.result);
  }

  validateCredentials (strategy, _id, body, options: ArgsSecurityControllerValidateCredentials = {}) {
    return this.query({
      _id,
      strategy,
      body,
      action: 'validateCredentials'
    }, options)
      .then(response => response.result);
  }
}

export interface ArgsSecurityControllerCreateApiKey extends ArgsDefault {
    expiresIn?: string | number;
    _id?: string;
    refresh?: 'wait_for' | 'false';
}

export interface ArgsSecurityControllerCheckRights extends ArgsDefault {
}

export interface ArgsSecurityControllerDeleteApiKey extends ArgsDefault {
    refresh?: 'wait_for' | 'false';
}

export interface ArgsSecurityControllerSearchApiKeys extends ArgsDefault {
    from?: number;
    size?: number;
    lang?: string;
}

export interface ArgsSecurityControllerCreateCredentials extends ArgsDefault {
}

export interface ArgsSecurityControllerCreateFirstAdmin extends ArgsDefault {
    reset?: boolean;
}

export interface ArgsSecurityControllerCreateOrReplaceProfile extends ArgsDefault {
}

export interface ArgsSecurityControllerCreateOrReplaceRole extends ArgsDefault {
    force?: boolean;
}

export interface ArgsSecurityControllerCreateProfile extends ArgsDefault {
}

export interface ArgsSecurityControllerCreateRestrictedUser extends ArgsDefault {
}

export interface ArgsSecurityControllerCreateRole extends ArgsDefault {
    force?: boolean;
}

export interface ArgsSecurityControllerCreateUser extends ArgsDefault {
}

export interface ArgsSecurityControllerDeleteCredentials extends ArgsDefault {
}

export interface ArgsSecurityControllerDeleteProfile extends ArgsDefault {
}

export interface ArgsSecurityControllerDeleteRole extends ArgsDefault {
}

export interface ArgsSecurityControllerDeleteUser extends ArgsDefault {
}

export interface ArgsSecurityControllerGetAllCredentialFields extends ArgsDefault {
}

export interface ArgsSecurityControllerGetCredentialFields extends ArgsDefault {
}

export interface ArgsSecurityControllerGetCredentials extends ArgsDefault {
}

export interface ArgsSecurityControllerGetCredentialsById extends ArgsDefault {
}

export interface ArgsSecurityControllerGetProfile extends ArgsDefault {
}

export interface ArgsSecurityControllerGetProfileMapping extends ArgsDefault {
}

export interface ArgsSecurityControllerGetProfileRights extends ArgsDefault {
}

export interface ArgsSecurityControllerGetRole extends ArgsDefault {
}

export interface ArgsSecurityControllerGetRoleMapping extends ArgsDefault {
}

export interface ArgsSecurityControllerGetUser extends ArgsDefault {
}

export interface ArgsSecurityControllerGetUserMapping extends ArgsDefault {
}

export interface ArgsSecurityControllerGetUserRights extends ArgsDefault {
}

export interface ArgsSecurityControllerGetUserStrategies extends ArgsDefault {
}

export interface ArgsSecurityControllerHasCredentials extends ArgsDefault {
}

export interface ArgsSecurityControllerMDeleteProfiles extends ArgsDefault {
}

export interface ArgsSecurityControllerMDeleteRoles extends ArgsDefault {
}

export interface ArgsSecurityControllerMDeleteUsers extends ArgsDefault {
}

export interface ArgsSecurityControllerMGetProfiles extends ArgsDefault {
}

export interface ArgsSecurityControllerMGetUsers extends ArgsDefault {
}

export interface ArgsSecurityControllerMGetRoles extends ArgsDefault {
}

export interface ArgsSecurityControllerReplaceUser extends ArgsDefault {
}

export interface ArgsSecurityControllerSearchProfiles extends ArgsDefault {
}

export interface ArgsSecurityControllerSearchRoles extends ArgsDefault {
}

export interface ArgsSecurityControllerSearchUsers extends ArgsDefault {
}

export interface ArgsSecurityControllerUpdateCredentials extends ArgsDefault {
}

export interface ArgsSecurityControllerUpdateProfile extends ArgsDefault {
}

export interface ArgsSecurityControllerUpdateProfileMapping extends ArgsDefault {
}

export interface ArgsSecurityControllerUpdateRole extends ArgsDefault {
    force?: boolean;
}

export interface ArgsSecurityControllerUpdateRoleMapping extends ArgsDefault {
}

export interface ArgsSecurityControllerUpdateUser extends ArgsDefault {
}

export interface ArgsSecurityControllerUpdateUserMapping extends ArgsDefault {
}

export interface ArgsSecurityControllerValidateCredentials extends ArgsDefault {
}
