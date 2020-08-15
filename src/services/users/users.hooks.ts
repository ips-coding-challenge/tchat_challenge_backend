import * as feathersAuthentication from "@feathersjs/authentication";
import * as local from "@feathersjs/authentication-local";
import {
  disallow,
  preventChanges,
  iff,
  isProvider,
} from "feathers-hooks-common";
import { setField } from "feathers-authentication-hooks";
import Joi from "@hapi/joi";
import validate from "@feathers-plus/validate-joi";
import { MethodNotAllowed } from "@feathersjs/errors";
import checkEmailUnique from "../../hooks/check-email-unique";
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = feathersAuthentication.hooks;
const { hashPassword, protect } = local.hooks;

const createSchema = Joi.object().keys({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  password_confirmation: Joi.any().equal(Joi.ref("password")).required(),
});

const patchSchema = Joi.object().keys({
  email: Joi.string().email(),
  password: Joi.string().min(6),
  bio: Joi.string(),
  phone: Joi.string()
    .regex(/\d{10}/)
    .message("Your phone should have 10 characters"),
  name: Joi.string(),
  avatar: Joi.string().uri(),
});

const limitToUser = setField({
  from: "params.user._id",
  as: "id",
});

export default {
  before: {
    all: [],
    find: [authenticate("jwt")],
    get: [authenticate("jwt"), limitToUser],
    create: [
      iff(
        isProvider("rest") || isProvider("socketio"),
        validate.form(createSchema)
      ),
      checkEmailUnique(),
      hashPassword("password"),
    ],
    update: [disallow()],
    patch: [
      authenticate("jwt"),
      limitToUser,
      iff(
        isProvider("rest") || isProvider("socketio"),
        validate.form(patchSchema)
      ),
      hashPassword("password"),
      iff(
        isProvider("rest") || isProvider("socketio"),
        preventChanges(true, "githubId")
      ),
      checkEmailUnique(),
    ],
    // TODO Authorize an admin to do so ?
    remove: [authenticate("jwt"), disallow()],
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect("password"),
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
