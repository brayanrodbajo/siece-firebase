'use strict';var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}const admin = require('firebase-admin');
const db = admin.firestore();


exports.getProfile = (() => {var _ref = (0, _asyncToGenerator3.default)(function* (req, res) {
    let data = { user: req.user };
    const usersSnapshot = yield db.collection('users').
    where('user_id', '==', req.user.uid).
    get();
    try {
      if (usersSnapshot.empty) {
        data.warning = 'Debe completar todos los datos del perfil antes de poder reportar datos';
      } else if (usersSnapshot.size > 1) {
        data.error = 'Error de información duplicada. Contacte al administrador';
      } else {
        data.institution = usersSnapshot.docs[0].data();
      }
      return res.render('profile', data);
    } catch (error) {
      console.log("Error: ", error);
      data.error = "Error al consultar datos del usuario";
      return res.render('profile', data);
    }
  });return function (_x, _x2) {return _ref.apply(this, arguments);};})();

exports.saveProfile = (() => {var _ref2 = (0, _asyncToGenerator3.default)(function* (req, res) {
    let data = { user: req.user };
    const formData = req.body;
    let institution = { user_id: req.user.uid };
    data.institution = institution;
    const usersSnapshot = yield db.collection('users').
    where('user_id', '==', req.user.uid).
    get();
    try {
      if (usersSnapshot.size > 1) {
        console.log('Error: ', 'Duplicate user profile document');
        data.error = 'Error de información duplicada. Contacte al administrador';
      } else {
        if (validateFormData(formData)) {
          institution.name = formData.institution_name;

          let type = {};
          type.name = formData.type;
          formData.type_other ? type.other = formData.type_other : type.other = '';
          institution.type = type;

          let character = {};
          character.name = formData.character;
          formData.character_other ? character.other = formData.character_other : character.other = '';
          institution.character = character;

          institution.country = formData.country;

          institution.foundation_year = Number(formData.foundation_year);

          institution.representative_name = formData.representative_name;

          institution.representative_position = formData.representative_position;

          institution.employees = Number(formData.employees);

          institution.has_platform = formData.has_platform;

          if (institution.has_platform === 'si') {
            institution.platform_ownership = formData.platform_ownership;
          } else {
            institution.platform_ownership = '';
          }

          institution.regulated = formData.regulated;

          if (institution.regulated === 'si') {
            institution.regulating_entity = formData.regulating_entity;
          } else {
            institution.regulating_entity = '';
          }

          institution.credit_rating = formData.credit_rating;

          if (institution.credit_rating === 'si') {
            institution.rating_agency = formData.rating_agency;
          } else {
            institution.rating_agency = '';
          }

          const newProfile = usersSnapshot.empty;
          let result = null;
          console.log(institution);
          if (newProfile) {
            institution.created_at = new Date().toUTCString();
            institution.updated_at = new Date().toUTCString();
            result = yield db.collection('users').doc().set(institution);
          } else {
            institution.updated_at = new Date().toUTCString();
            let institutionRef = usersSnapshot.docs[0].ref;
            result = yield institutionRef.set(institution, { merge: true });
          }
          console.log('Data saved: ', result);
          const userRecord = yield admin.auth().updateUser(req.user.uid, {
            displayName: formData.institution_name });

          console.log('Successfully updated user: ', userRecord.uid);
          data.success = 'Datos guardados exitosamente';
          data.user = userRecord;
        } else {
          console.log('Error', 'Form validation failed');
          data.error = 'Falló la validación del formulario';
        }
      }
      return res.render('profile', data);
    } catch (error) {
      console.log('Error: ', error);
      if (!data.error)
      data.error = 'Error al consultar la base de datos. Contacte al administrador';
      return res.render('profile', data);
    }
  });return function (_x3, _x4) {return _ref2.apply(this, arguments);};})();

const validateFormData = formData => {
  if (!formData.institution_name) {
    return false;
  }

  if (!formData.type) {
    return false;
  }

  if (formData.type === 'otra' && !formData.type_other) {
    return false;
  }

  if (!formData.character) {
    return false;
  }

  if (formData.character === 'otra' && !formData.character_other) {
    return false;
  }

  if (!formData.country) {
    return false;
  }

  if (!formData.foundation_year) {
    return false;
  }

  if (!formData.representative_name) {
    return false;
  }
  if (!formData.representative_position) {
    return false;
  }

  if (!formData.employees) {
    return false;
  }

  if (!formData.has_platform) {
    return false;
  }

  if (formData.has_platform === 'si' && !formData.platform_ownership) {
    return false;
  }

  if (!formData.regulated) {
    return false;
  }

  if (formData.regulated === 'si' && !formData.regulating_entity) {
    return false;
  }

  if (!formData.credit_rating) {
    return false;
  }

  if (formData.credit_rating === 'si' && !formData.rating_agency) {
    return false;
  }

  return true;
};