'use strict';var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}const admin = require('firebase-admin');
const db = admin.firestore();
const underscore = require('underscore');


exports.listIndicators = (req, res) => {
  let data = { user: req.user, is_admin: req.is_admin };

  return res.render('select-report', data);
};

exports.getIndicator = (req, res) => {
  let data = { user: req.user, is_admin: req.is_admin };
  data.selected_report = req.body.report;
  data.from_year = req.body.from_year;
  data.to_year = req.body.to_year;

  switch (req.body.report) {
    case 'financiamiento_anual':{
        data.indicator_name = 'Monto promedio de crédito educativo por año';
        return financiamientoAnual(req, res, data);
      }
    case 'financiamiento_beneficiario':{
        data.indicator_name = 'Monto promedio de crédito educativo por beneficiario para el año que se reporta';
        return financiamientoBeneficiario(req, res, data);
      }
    case 'financiamiento_institucion':{
        data.indicator_name = 'Monto promedio de crédito educativo por beneficiario desde el inicio del programa de CE hasta el año que se reporta';
        return financiamientoInstitucion(req, res, data);
      }
    case 'financiamiento_fuentes':{
        data.indicator_name = 'Proporción de financiación de CE según fuente de financiamiento por año - ' + getFinancingSource(req.body.source);
        return financiamientoFuentes(req, res, data);
      }
    case 'variacion_anual':{
        data.indicator_name = 'Variación anual de CE';
        return variacionAnual(req, res, data);
      }
    case 'asignacion_lugar':{
        data.indicator_name = 'Proporción de CE según el lugar de estudios - ' + req.body.place.toUpperCase();
        return asignacionLugar(req, res, data);
      }
    case 'asignacion_nivel':{
        data.indicator_name = 'Proporción de CE según el nivel de estudios - ' + req.body.level.toUpperCase();
        return asignacionNivel(req, res, data);
      }
    case 'asignacion_genero':{
        data.indicator_name = 'Proporción de CE según el género - ' + req.body.sex.toUpperCase();
        return asignacionGenero(req, res, data);
      }
    case 'asignacion_nuevo':{
        data.indicator_name = 'Proporción anual de CE nuevo según el lugar de estudios - ' + req.body.place.toUpperCase();
        return asignacionNuevoLugar(req, res, data);
      }
    case 'asignacion_nuevo_nivel':{
        data.indicator_name = 'Proporción anual de CE nuevo según el nivel de estudios - ' + req.body.level.toUpperCase();
        return asignacionNuevoNivel(req, res, data);
      }
    case 'variacion_cartera_vigente':{
        data.indicator_name = 'Variación anual de la cartera vigente';
        return variacionCarteraVigente(req, res, data);
      }
    case 'variacion_cartera_vencida':{
        data.indicator_name = 'Variación anual de la cartera vencida';
        return variacionCarteraVencida(req, res, data);
      }
    case 'cartera_vigente_nivel':{
        data.indicator_name = 'Proporción anual de la cartera vigente según el nivel de estudios - ' + req.body.level.toUpperCase();
        return carteraVigenteNivel(req, res, data);
      }
    case 'cartera_vigente_lugar':{
        data.indicator_name = 'Proporción anual de la cartera vigente según el lugar de estudios - ' + req.body.place.toUpperCase();
        return carteraVigenteLugar(req, res, data);
      }
    case 'cartera_vigente_genero':{
        data.indicator_name = 'Proporción anual de la cartera vigente según el género - ' + req.body.sex.toUpperCase();
        return carteraVigenteGenero(req, res, data);
      }
    case 'cartera_vencida':{
        data.indicator_name = 'Proporción anual de la cartera vencida';
        return carteraVencida(req, res, data);
      }
    case 'cartera_vencida_nivel':{
        data.indicator_name = 'Proporción anual de la cartera vencida según el nivel de estudios - ' + req.body.level.toUpperCase();
        return carteraVencidaNivel(req, res, data);
      }
    case 'cartera_vencida_lugar':{
        data.indicator_name = 'Proporción anual de la cartera vencida según el lugar de estudios - ' + req.body.place.toUpperCase();
        return carteraVencidaLugar(req, res, data);
      }
    case 'cartera_vencida_genero':{
        data.indicator_name = 'Proporción anual de la cartera vencida según el género - ' + req.body.sex.toUpperCase();
        return carteraVencidaGenero(req, res, data);
      }
    case 'empleado_beneficiario':{
        data.indicator_name = 'Relación empleado-beneficiario de CE';
        return empleadoBeneficiario(req, res, data);
      }
    case 'plataforma':{
        data.indicator_name = 'Proporción de ICE con plataforma tecnológica';
        return plataformaTecnologica(req, res, data);
      }
    case 'regulacion':{
        data.indicator_name = 'Proporción de ICE reguladas';
        return regulacion(req, res, data);
      }
    case 'calificacion':{
        data.indicator_name = 'Proporción de ICE calificadas';
        return calificacion(req, res, data);
      }
    default:{
        data.error = "No ha seleccionado un indicador válido";
        return res.render('select-report', data);
      }}

};

const financiamientoAnual = (() => {var _ref = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const reportsSnapshot = yield db.collection('reports').
        where('status', '==', 'Aceptado').
        where('reported_year', '>=', Number(formData.from_year)).
        where('reported_year', '<=', Number(formData.to_year)).
        get();
        if (reportsSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let reports = reportsSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let userCache = {};
          let results = [];
          for (let i = formData.from_year; i <= formData.to_year; i++) {
            let result = { reported_year: Number(i) };
            results.push(result);
          }
          const additionalColumns = [
          { name: 'Total Inversión', format: 'money' },
          { name: 'Total Créditos', format: 'number' }];


          for (let i = 0; i < reports.length; i++) {
            let total_investment = 0;
            let total_credits = 0;
            if (reports[i].programs && reports[i].programs instanceof Array) {
              for (let j = 0; j < reports[i].programs.length; j++) {
                const program = reports[i].programs[j];
                // console.log(program);
                if (program.investment)
                total_investment += Number(program.investment);

                if (program.credit_pais) {
                  if (program.credit_pais.new)
                  total_credits += Number(program.credit_pais.new);

                  if (program.credit_pais.old)
                  total_credits += Number(program.credit_pais.old);
                }

                if (program.credit_exterior) {
                  if (program.credit_exterior.new)
                  total_credits += Number(program.credit_exterior.new);

                  if (program.credit_exterior.old)
                  total_credits += Number(program.credit_exterior.old);
                }
              }
            }

            let indicatorValue = total_investment / total_credits;
            if (indicatorValue) {
              // console.log(indicatorValue);
              indicatorValue = indicatorValue.toFixed(2);
              if (userCache[reports[i].user_id]) {
                results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_investment, total_credits];
              } else {
                const userRecord = yield admin.auth().getUser(reports[i].user_id);
                userCache[reports[i].user_id] = userRecord.displayName;
                results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_investment, total_credits];
              }
            }
          }

          let institutionNames = [];
          Object.keys(userCache).forEach(function (key) {return institutionNames.push(userCache[key]);});

          data.line_chart_results = results;
          data.table_results = tableResults(results, institutionNames, 3); // length of additional columns + indicator
          data.institution_names = underscore.sample(institutionNames, 5);
          data.type = 'money';
          data.additional_columns = additionalColumns;
          // console.log(data.line_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function financiamientoAnual(_x, _x2, _x3) {return _ref.apply(this, arguments);};})();

const financiamientoBeneficiario = (() => {var _ref2 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const reportsSnapshot = yield db.collection('reports').
        where('status', '==', 'Aceptado').
        where('reported_year', '>=', Number(formData.from_year)).
        where('reported_year', '<=', Number(formData.to_year)).
        get();
        if (reportsSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let reports = reportsSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let userCache = {};
          let results = [];
          for (let i = formData.from_year; i <= formData.to_year; i++) {
            let result = { reported_year: Number(i) };
            results.push(result);
          }
          const additionalColumns = [
          { name: 'Total Inversión', format: 'money' },
          { name: 'Total Beneficiarios', format: 'number' }];


          for (let i = 0; i < reports.length; i++) {
            let total_investment = 0;
            let total_beneficiaries = 0;
            if (reports[i].programs && reports[i].programs instanceof Array) {
              for (let j = 0; j < reports[i].programs.length; j++) {
                const program = reports[i].programs[j];
                // console.log(program);
                if (program.investment)
                total_investment += Number(program.investment);

                if (program.beneficiaries) {
                  total_beneficiaries += Number(program.beneficiaries);
                }
              }
            }

            let indicatorValue = total_investment / total_beneficiaries;
            if (indicatorValue) {
              // console.log(indicatorValue);
              indicatorValue = indicatorValue.toFixed(2);
              if (userCache[reports[i].user_id]) {
                results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_investment, total_beneficiaries];
              } else {
                const userRecord = yield admin.auth().getUser(reports[i].user_id);
                userCache[reports[i].user_id] = userRecord.displayName;
                results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_investment, total_beneficiaries];
              }
            }
          }

          let institutionNames = [];
          Object.keys(userCache).forEach(function (key) {return institutionNames.push(userCache[key]);});

          data.line_chart_results = results;
          data.table_results = tableResults(results, institutionNames, 3);
          data.institution_names = institutionNames;
          data.type = 'money';
          data.additional_columns = additionalColumns;
          // console.log(data.line_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function financiamientoBeneficiario(_x4, _x5, _x6) {return _ref2.apply(this, arguments);};})();

const financiamientoInstitucion = (() => {var _ref3 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const reportsSnapshot = yield db.collection('reports').
        where('status', '==', 'Aceptado').
        where('reported_year', '>=', Number(formData.from_year)).
        where('reported_year', '<=', Number(formData.to_year)).
        get();
        if (reportsSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let reports = reportsSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let userCache = {};
          let results = [];
          for (let i = formData.from_year; i <= formData.to_year; i++) {
            let result = { reported_year: Number(i) };
            results.push(result);
          }
          const additionalColumns = [
          { name: 'Total Inversión', format: 'money' },
          { name: 'Total Estudiantes', format: 'number' }];


          for (let i = 0; i < reports.length; i++) {
            const total_investment = reports[i].total_investment;
            const total_students = reports[i].total_students;
            let indicatorValue = total_investment / total_students;
            if (indicatorValue) {
              // console.log(indicatorValue);
              indicatorValue = indicatorValue.toFixed(2);
              if (userCache[reports[i].user_id]) {
                results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_investment, total_students];
              } else {
                const userRecord = yield admin.auth().getUser(reports[i].user_id);
                userCache[reports[i].user_id] = userRecord.displayName;
                results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_investment, total_students];
              }
            }
          }

          let institutionNames = [];
          Object.keys(userCache).forEach(function (key) {return institutionNames.push(userCache[key]);});

          data.bar_chart_results = results;
          data.table_results = tableResults(results, institutionNames, 3);
          data.institution_names = underscore.sample(institutionNames, 10);
          data.type = 'money';
          data.additional_columns = additionalColumns;
          // console.log(data.bar_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function financiamientoInstitucion(_x7, _x8, _x9) {return _ref3.apply(this, arguments);};})();

const financiamientoFuentes = (() => {var _ref4 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const source = formData.source;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const reportsSnapshot = yield db.collection('reports').
        where('status', '==', 'Aceptado').
        where('reported_year', '>=', Number(formData.from_year)).
        where('reported_year', '<=', Number(formData.to_year)).
        get();
        if (reportsSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let reports = reportsSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let userCache = {};
          let results = [];
          for (let i = formData.from_year; i <= formData.to_year; i++) {
            let result = { reported_year: Number(i) };
            results.push(result);
          }
          const additionalColumns = [
          { name: 'Total Financiamiento', format: 'money' }];

          let funding_sources = {
            gubernamental: null,
            privado: null,
            nacional: null,
            internacional: null,
            donaciones: null,
            cartera: null,
            terceros: null,
            cooperacion: null,
            impuestos: null,
            titularizacion: null,
            propios: null,
            inversiones: null,
            otra: null };


          for (let i = 0; i < reports.length; i++) {
            let total_source_amount = 0;
            Object.keys(funding_sources).forEach(function (item) {return funding_sources[item] = null;});

            if (reports[i].funding_sources && reports[i].funding_sources instanceof Array) {
              // console.log(reports[i].funding_sources);
              for (let j = 0; j < reports[i].funding_sources.length; j++) {
                total_source_amount += Number(reports[i].funding_sources[j].amount);
                funding_sources[reports[i].funding_sources[j].source] = reports[i].funding_sources[j].amount;
              }
            }

            if (source === 'todos') {
              let indicators = Object.values(funding_sources).
              map(function (indicator) {
                return (indicator / total_source_amount * 100).toFixed(2);
              });
              indicators.push(total_source_amount);
              if (userCache[reports[i].user_id]) {
                results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = indicators;
              } else {
                const userRecord = yield admin.auth().getUser(reports[i].user_id);
                userCache[reports[i].user_id] = userRecord.displayName;
                results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = indicators;
              }
            } else {
              let indicatorValue = funding_sources[source] / total_source_amount * 100;
              if (indicatorValue) {
                // console.log(indicatorValue);
                indicatorValue = indicatorValue.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_source_amount];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_source_amount];
                }
              }
            }
          }

          let institutionNames = [];
          Object.keys(userCache).forEach(function (key) {return institutionNames.push(userCache[key]);});

          data.line_chart_results = results;
          if (source === 'todos') {
            data.table_results = tableResults(results, institutionNames, 14);
            data.indicator_labels = Object.keys(funding_sources).map(function (item) {return getFinancingSource(item);}).slice(1);
          } else {
            data.table_results = tableResults(results, institutionNames, 2);
          }
          data.institution_names = underscore.sample(institutionNames, 5);
          data.type = 'percentage';
          data.first_indicator_label = getFinancingSource('gubernamental');
          data.source = source;
          data.additional_columns = additionalColumns;
          // console.log(data.line_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function financiamientoFuentes(_x10, _x11, _x12) {return _ref4.apply(this, arguments);};})();

const variacionAnual = (() => {var _ref5 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const reportsSnapshot = yield db.collection('reports').
        where('status', '==', 'Aceptado').
        where('reported_year', '>=', Number(formData.from_year - 1)).
        where('reported_year', '<=', Number(formData.to_year)).
        get();
        if (reportsSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let reports = reportsSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let userCache = {};
          let results = [];
          for (let i = formData.from_year - 1; i <= formData.to_year; i++) {
            let result = { reported_year: Number(i) };
            results.push(result);
          }
          const additionalColumns = [
          { name: 'Total Créditos', format: 'number' }];


          for (let i = 0; i < reports.length; i++) {
            let total_credits = 0;
            if (reports[i].programs && reports[i].programs instanceof Array) {
              for (let j = 0; j < reports[i].programs.length; j++) {
                const program = reports[i].programs[j];

                if (program.credit_pais) {
                  if (program.credit_pais.new)
                  total_credits += Number(program.credit_pais.new);

                  if (program.credit_pais.old)
                  total_credits += Number(program.credit_pais.old);
                }

                if (program.credit_exterior) {
                  if (program.credit_exterior.new)
                  total_credits += Number(program.credit_exterior.new);

                  if (program.credit_exterior.old)
                  total_credits += Number(program.credit_exterior.old);
                }
              }
            }

            let indicatorValue = total_credits;
            if (indicatorValue) {
              // console.log(indicatorValue);
              // indicatorValue = indicatorValue.toFixed(2);
              if (userCache[reports[i].user_id]) {
                results[reports[i].reported_year - formData.from_year + 1][userCache[reports[i].user_id]] = [indicatorValue, total_credits];
              } else {
                const userRecord = yield admin.auth().getUser(reports[i].user_id);
                userCache[reports[i].user_id] = userRecord.displayName;
                results[reports[i].reported_year - formData.from_year + 1][userCache[reports[i].user_id]] = [indicatorValue, total_credits];
              }
            }
          }

          let institutionNames = [];
          Object.keys(userCache).forEach(function (key) {return institutionNames.push(userCache[key]);});

          let variationResults = [];
          for (let i = 1; i < results.length; i++) {
            const obj = { reported_year: Number(results[i].reported_year) };
            for (let j = 0; j < institutionNames.length; j++) {
              let key = institutionNames[j];
              if (results[i][key] && results[i - 1][key]) {
                obj[key] = [((results[i][key][0] - results[i - 1][key][0]) / results[i - 1][key][0] * 100).toFixed(2), results[i][key][1]];
              } else if (results[i - 1][key]) {
                obj[key] = [-100, null];
              } else {
                obj[key] = [100, results[i][key][1]];
              }
            }
            variationResults.push(obj);
          }

          data.line_chart_results = variationResults;
          data.table_results = tableResults(variationResults, institutionNames, 1);
          data.institution_names = underscore.sample(institutionNames, 5);
          data.type = 'percentage';
          data.additional_columns = additionalColumns;
          // console.log(data.line_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function variacionAnual(_x13, _x14, _x15) {return _ref5.apply(this, arguments);};})();

const asignacionLugar = (() => {var _ref6 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const place = formData.place;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const reportsSnapshot = yield db.collection('reports').
        where('status', '==', 'Aceptado').
        where('reported_year', '>=', Number(formData.from_year)).
        where('reported_year', '<=', Number(formData.to_year)).
        get();
        if (reportsSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let reports = reportsSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let userCache = {};
          let results = [];
          for (let i = formData.from_year; i <= formData.to_year; i++) {
            let result = { reported_year: Number(i) };
            results.push(result);
          }
          const additionalColumns = [
          { name: 'Total Créditos', format: 'number' }];


          for (let i = 0; i < reports.length; i++) {
            let place_credits = 0;
            let total_credits = 0;
            let pais_credits = 0;
            let exterior_credits = 0;
            if (reports[i].programs && reports[i].programs instanceof Array) {
              for (let j = 0; j < reports[i].programs.length; j++) {
                const program = reports[i].programs[j];

                if (program.credit_pais) {
                  if (program.credit_pais.new) {
                    total_credits += Number(program.credit_pais.new);
                    if (place === 'pais')
                    place_credits += Number(program.credit_pais.new);
                    if (place === 'todos')
                    pais_credits += Number(program.credit_pais.new);
                  }

                  if (program.credit_pais.old) {
                    total_credits += Number(program.credit_pais.old);
                    if (place === 'pais')
                    place_credits += Number(program.credit_pais.old);
                    if (place === 'todos')
                    pais_credits += Number(program.credit_pais.old);
                  }
                }

                if (program.credit_exterior) {
                  if (program.credit_exterior.new) {
                    total_credits += Number(program.credit_exterior.new);
                    if (place === 'exterior')
                    place_credits += Number(program.credit_exterior.new);
                    if (place === 'todos')
                    exterior_credits += Number(program.credit_exterior.new);
                  }

                  if (program.credit_exterior.old) {
                    total_credits += Number(program.credit_exterior.old);
                    if (place === 'exterior')
                    place_credits += Number(program.credit_exterior.old);
                    if (place === 'todos')
                    exterior_credits += Number(program.credit_exterior.old);
                  }
                }
              }
            }

            if (place === 'todos') {
              let paisIndicator = pais_credits / total_credits * 100;
              let exteriorIndicator = exterior_credits / total_credits * 100;
              if (paisIndicator && exteriorIndicator) {
                paisIndicator = paisIndicator.toFixed(2);
                exteriorIndicator = exteriorIndicator.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [paisIndicator, exteriorIndicator, total_credits];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [paisIndicator, exteriorIndicator, total_credits];
                }
              }
            } else {
              let indicatorValue = place_credits / total_credits * 100;
              if (indicatorValue) {
                // console.log(indicatorValue);
                indicatorValue = indicatorValue.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_credits];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_credits];
                }
              }
            }
          }

          let institutionNames = [];
          Object.keys(userCache).forEach(function (key) {return institutionNames.push(userCache[key]);});

          data.bar_chart_results = results;
          if (place === 'todos') {
            data.table_results = tableResults(results, institutionNames, 3);
            data.indicator_labels = ['Exterior'];
          } else
          {
            data.table_results = tableResults(results, institutionNames, 2);
          }
          data.institution_names = underscore.sample(institutionNames, 10);
          data.type = 'percentage';
          data.first_indicator_label = 'País';
          data.place = place;
          data.additional_columns = additionalColumns;
          // console.log(data.bar_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function asignacionLugar(_x16, _x17, _x18) {return _ref6.apply(this, arguments);};})();

const asignacionNivel = (() => {var _ref7 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const level = formData.level;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const reportsSnapshot = yield db.collection('reports').
        where('status', '==', 'Aceptado').
        where('reported_year', '>=', Number(formData.from_year)).
        where('reported_year', '<=', Number(formData.to_year)).
        get();
        if (reportsSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let reports = reportsSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let userCache = {};
          let results = [];
          for (let i = formData.from_year; i <= formData.to_year; i++) {
            let result = { reported_year: Number(i) };
            results.push(result);
          }
          const additionalColumns = [
          { name: 'Total Créditos', format: 'number' }];


          for (let i = 0; i < reports.length; i++) {
            let level_credits = 0;
            let total_credits = 0;
            let pregrado_credits = 0;
            let posgrado_credits = 0;
            if (reports[i].programs && reports[i].programs instanceof Array) {
              for (let j = 0; j < reports[i].programs.length; j++) {
                const program = reports[i].programs[j];

                if (program.credit_pais) {
                  if (program.credit_pais.new) {
                    total_credits += Number(program.credit_pais.new);
                    if (program.level === level)
                    level_credits += Number(program.credit_pais.new);
                    if (level === 'todos') {
                      if (program.level === 'pregrado')
                      pregrado_credits += Number(program.credit_pais.new);else

                      posgrado_credits += Number(program.credit_pais.new);
                    }
                  }

                  if (program.credit_pais.old) {
                    total_credits += Number(program.credit_pais.old);
                    if (program.level === level)
                    level_credits += Number(program.credit_pais.old);
                    if (level === 'todos') {
                      if (program.level === 'pregrado')
                      pregrado_credits += Number(program.credit_pais.old);else

                      posgrado_credits += Number(program.credit_pais.old);
                    }
                  }
                }

                if (program.credit_exterior) {
                  if (program.credit_exterior.new) {
                    total_credits += Number(program.credit_exterior.new);
                    if (program.level === level)
                    level_credits += Number(program.credit_exterior.new);
                    if (level === 'todos') {
                      if (program.level === 'pregrado')
                      pregrado_credits += Number(program.credit_exterior.new);else

                      posgrado_credits += Number(program.credit_exterior.new);
                    }
                  }

                  if (program.credit_exterior.old) {
                    total_credits += Number(program.credit_exterior.old);
                    if (program.level === level)
                    level_credits += Number(program.credit_exterior.old);
                    if (level === 'todos') {
                      if (program.level === 'pregrado')
                      pregrado_credits += Number(program.credit_exterior.old);else

                      posgrado_credits += Number(program.credit_exterior.old);
                    }
                  }
                }
              }
            }

            if (level === 'todos') {
              let pregradoIndicator = pregrado_credits / total_credits * 100;
              let posgradoIndicator = posgrado_credits / total_credits * 100;
              if (pregradoIndicator && posgradoIndicator) {
                pregradoIndicator = pregradoIndicator.toFixed(2);
                posgradoIndicator = posgradoIndicator.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [pregradoIndicator, posgradoIndicator, total_credits];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [pregradoIndicator, posgradoIndicator, total_credits];
                }
              }
            } else {
              let indicatorValue = level_credits / total_credits * 100;
              if (indicatorValue) {
                // console.log(indicatorValue);
                indicatorValue = indicatorValue.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_credits];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_credits];
                }
              }
            }
          }

          let institutionNames = [];
          Object.keys(userCache).forEach(function (key) {return institutionNames.push(userCache[key]);});

          data.bar_chart_results = results;
          if (level === 'todos') {
            data.table_results = tableResults(results, institutionNames, 3);
            data.indicator_labels = ['Posgrado'];
          } else {
            data.table_results = tableResults(results, institutionNames, 2);
          }
          data.institution_names = underscore.sample(institutionNames, 10);
          data.type = 'percentage';
          data.first_indicator_label = 'Pregrado';
          data.level = level;
          data.additional_columns = additionalColumns;
          // console.log(data.bar_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function asignacionNivel(_x19, _x20, _x21) {return _ref7.apply(this, arguments);};})();

const asignacionGenero = (() => {var _ref8 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const sex = formData.sex;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const reportsSnapshot = yield db.collection('reports').
        where('status', '==', 'Aceptado').
        where('reported_year', '>=', Number(formData.from_year)).
        where('reported_year', '<=', Number(formData.to_year)).
        get();
        if (reportsSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let reports = reportsSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let userCache = {};
          let results = [];
          for (let i = formData.from_year; i <= formData.to_year; i++) {
            let result = { reported_year: Number(i) };
            results.push(result);
          }
          const additionalColumns = [
          { name: 'Total Créditos', format: 'number' }];


          for (let i = 0; i < reports.length; i++) {
            let total_credits = reports[i].female_students + reports[i].male_students;
            let female_credits = reports[i].female_students;
            let male_credits = reports[i].male_students;
            let indicatorValue;
            let femaleIndicator;
            let maleIndicator;
            if (sex === 'femenino') {
              indicatorValue = female_credits / total_credits * 100;
            } else if (sex === 'masculino') {
              indicatorValue = male_credits / total_credits * 100;
            } else {
              femaleIndicator = female_credits / total_credits * 100;
              maleIndicator = male_credits / total_credits * 100;
            }

            if (sex === 'todos') {
              let femaleIndicator = female_credits / total_credits * 100;
              let maleIndicator = male_credits / total_credits * 100;
              if (femaleIndicator && maleIndicator) {
                femaleIndicator = femaleIndicator.toFixed(2);
                maleIndicator = maleIndicator.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [femaleIndicator, maleIndicator, total_credits];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [femaleIndicator, maleIndicator, total_credits];
                }
              }
            } else {
              if (indicatorValue) {
                // console.log(indicatorValue);
                indicatorValue = indicatorValue.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_credits];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_credits];
                }
              }
            }
          }

          let institutionNames = [];
          Object.keys(userCache).forEach(function (key) {return institutionNames.push(userCache[key]);});

          data.bar_chart_results = results;
          if (sex === 'todos') {
            data.table_results = tableResults(results, institutionNames, 3);
            data.indicator_labels = ['Masculino'];
          } else {
            data.table_results = tableResults(results, institutionNames, 2);
          }
          data.institution_names = underscore.sample(institutionNames, 10);
          data.type = 'percentage';
          data.first_indicator_label = 'Femenino';
          data.sex = sex;
          data.additional_columns = additionalColumns;
          // console.log(data.bar_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function asignacionGenero(_x22, _x23, _x24) {return _ref8.apply(this, arguments);};})();

const asignacionNuevoLugar = (() => {var _ref9 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const place = formData.place;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const reportsSnapshot = yield db.collection('reports').
        where('status', '==', 'Aceptado').
        where('reported_year', '>=', Number(formData.from_year)).
        where('reported_year', '<=', Number(formData.to_year)).
        get();
        if (reportsSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let reports = reportsSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let userCache = {};
          let results = [];
          for (let i = formData.from_year; i <= formData.to_year; i++) {
            let result = { reported_year: Number(i) };
            results.push(result);
          }
          const additionalColumns = [
          { name: 'Total Créditos Nuevos', format: 'number' }];


          for (let i = 0; i < reports.length; i++) {
            let total_new_credits = 0;
            let new_pais_credits = 0;
            let new_exterior_credits = 0;
            if (reports[i].programs && reports[i].programs instanceof Array) {
              for (let j = 0; j < reports[i].programs.length; j++) {
                const program = reports[i].programs[j];

                if (program.credit_pais && program.credit_pais.new) {
                  total_new_credits += Number(program.credit_pais.new);
                  if (place === 'pais' || place === 'todos') {
                    new_pais_credits += Number(program.credit_pais.new);
                  }
                }

                if (program.credit_exterior && program.credit_exterior.new) {
                  total_new_credits += Number(program.credit_exterior.new);
                  if (place === 'exterior' || place === 'todos') {
                    new_exterior_credits += Number(program.credit_exterior.new);
                  }
                }
              }
            }

            if (place === 'todos') {
              let paisIndicator = new_pais_credits / total_new_credits * 100;
              let exteriorIndicator = new_exterior_credits / total_new_credits * 100;
              if (paisIndicator && exteriorIndicator) {
                paisIndicator = paisIndicator.toFixed(2);
                exteriorIndicator = exteriorIndicator.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [paisIndicator, exteriorIndicator, total_new_credits];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [paisIndicator, exteriorIndicator, total_new_credits];
                }
              }
            } else {
              let indicatorValue;
              if (place === 'pais') {
                indicatorValue = new_pais_credits / total_new_credits * 100;
              } else {
                indicatorValue = new_exterior_credits / total_new_credits * 100;
              }
              if (indicatorValue) {
                // console.log(indicatorValue);
                indicatorValue = indicatorValue.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_new_credits];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_new_credits];
                }
              }
            }
          }

          let institutionNames = [];
          Object.keys(userCache).forEach(function (key) {return institutionNames.push(userCache[key]);});

          data.bar_chart_results = results;
          if (place === 'todos') {
            data.table_results = tableResults(results, institutionNames, 3);
            data.indicator_labels = ['Exterior'];
          } else {
            data.table_results = tableResults(results, institutionNames, 2);
          }
          data.institution_names = underscore.sample(institutionNames, 10);
          data.type = 'percentage';
          data.first_indicator_label = 'País';
          data.place = place;
          data.additional_columns = additionalColumns;
          // console.log(data.bar_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function asignacionNuevoLugar(_x25, _x26, _x27) {return _ref9.apply(this, arguments);};})();

const asignacionNuevoNivel = (() => {var _ref10 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const level = formData.level;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const reportsSnapshot = yield db.collection('reports').
        where('status', '==', 'Aceptado').
        where('reported_year', '>=', Number(formData.from_year)).
        where('reported_year', '<=', Number(formData.to_year)).
        get();
        if (reportsSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let reports = reportsSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let userCache = {};
          let results = [];
          for (let i = formData.from_year; i <= formData.to_year; i++) {
            let result = { reported_year: Number(i) };
            results.push(result);
          }
          const additionalColumns = [
          { name: 'Total Créditos Nuevos', format: 'number' }];


          for (let i = 0; i < reports.length; i++) {
            let total_new_credits = 0;
            let new_pregrado_credits = 0;
            let new_posgrado_credits = 0;
            if (reports[i].programs && reports[i].programs instanceof Array) {
              for (let j = 0; j < reports[i].programs.length; j++) {
                const program = reports[i].programs[j];
                if (program.level === level || level === 'todos') {
                  if (program.credit_pais && program.credit_pais.new) {
                    total_new_credits += Number(program.credit_pais.new);
                    if (program.level === 'pregrado')
                    new_pregrado_credits += Number(program.credit_pais.new);else

                    new_posgrado_credits += Number(program.credit_pais.new);
                  }

                  if (program.credit_exterior && program.credit_exterior.new) {
                    total_new_credits += Number(program.credit_exterior.new);
                    if (program.level === 'pregrado')
                    new_pregrado_credits += Number(program.credit_exterior.new);else

                    new_posgrado_credits += Number(program.credit_exterior.new);
                  }
                } else {
                  if (program.credit_pais && program.credit_pais.new) {
                    total_new_credits += Number(program.credit_pais.new);
                  }

                  if (program.credit_exterior && program.credit_exterior.new) {
                    total_new_credits += Number(program.credit_exterior.new);
                  }
                }
              }
            }

            if (level === 'todos') {
              let pregradoIndicator = new_pregrado_credits / total_new_credits * 100;
              let posgradoIndicator = new_posgrado_credits / total_new_credits * 100;
              if (pregradoIndicator && posgradoIndicator) {
                pregradoIndicator = pregradoIndicator.toFixed(2);
                posgradoIndicator = posgradoIndicator.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [pregradoIndicator, posgradoIndicator, total_new_credits];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [pregradoIndicator, posgradoIndicator, total_new_credits];
                }
              }
            } else {
              let indicatorValue;
              if (level === 'pregrado') {
                indicatorValue = new_pregrado_credits / total_new_credits * 100;
              } else {
                indicatorValue = new_posgrado_credits / total_new_credits * 100;
              }
              if (indicatorValue) {
                // console.log(indicatorValue);
                indicatorValue = indicatorValue.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_new_credits];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_new_credits];
                }
              }
            }
          }

          let institutionNames = [];
          Object.keys(userCache).forEach(function (key) {return institutionNames.push(userCache[key]);});

          data.bar_chart_results = results;
          if (level === 'todos') {
            data.table_results = tableResults(results, institutionNames, 3);
            data.indicator_labels = ['Posgrado'];
          } else {
            data.table_results = tableResults(results, institutionNames, 2);
          }
          data.institution_names = underscore.sample(institutionNames, 10);
          data.type = 'percentage';
          data.first_indicator_label = 'Pregrado';
          data.level = level;
          data.additional_columns = additionalColumns;
          // console.log(data.bar_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function asignacionNuevoNivel(_x28, _x29, _x30) {return _ref10.apply(this, arguments);};})();

const variacionCarteraVigente = (() => {var _ref11 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const reportsSnapshot = yield db.collection('reports').
        where('status', '==', 'Aceptado').
        where('reported_year', '>=', Number(formData.from_year) - 1).
        where('reported_year', '<=', Number(formData.to_year)).
        get();
        if (reportsSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let reports = reportsSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let userCache = {};
          let results = [];
          for (let i = formData.from_year - 1; i <= formData.to_year; i++) {
            let result = { reported_year: Number(i) };
            results.push(result);
          }
          const additionalColumns = [
          { name: 'Cartera Vigente', format: 'money' }];


          for (let i = 0; i < reports.length; i++) {
            let total_portfolio = 0;
            if (reports[i].current_portfolio && reports[i].current_portfolio instanceof Array) {
              for (let j = 0; j < reports[i].current_portfolio.length; j++) {
                total_portfolio += Number(reports[i].current_portfolio[j].amount);
              }
            }
            // if (reports[i].pastdue_portfolio && reports[i].pastdue_portfolio instanceof Array) {
            //   for (let j = 0; j < reports[i].pastdue_portfolio.length; j++) {
            //     total_portfolio += Number(reports[i].pastdue_portfolio[j].amount);
            //   }
            // }
            // if (reports[i].execution_portfolio && reports[i].execution_portfolio instanceof Array) {
            //   for (let j = 0; j < reports[i].execution_portfolio.length; j++) {
            //     total_portfolio += Number(reports[i].execution_portfolio[j].amount);
            //   }
            // }

            let indicatorValue = total_portfolio;
            if (indicatorValue) {
              // console.log(indicatorValue);
              // indicatorValue = indicatorValue.toFixed(2);
              if (userCache[reports[i].user_id]) {
                results[reports[i].reported_year - formData.from_year + 1][userCache[reports[i].user_id]] = [indicatorValue, total_portfolio];
              } else {
                const userRecord = yield admin.auth().getUser(reports[i].user_id);
                userCache[reports[i].user_id] = userRecord.displayName;
                results[reports[i].reported_year - formData.from_year + 1][userCache[reports[i].user_id]] = [indicatorValue, total_portfolio];
              }
            }
          }

          let institutionNames = [];
          Object.keys(userCache).forEach(function (key) {return institutionNames.push(userCache[key]);});

          let variationResults = [];
          for (let i = 1; i < results.length; i++) {
            const obj = { reported_year: Number(results[i].reported_year) };
            for (let j = 0; j < institutionNames.length; j++) {
              let key = institutionNames[j];
              if (results[i][key] && results[i - 1][key]) {
                obj[key] = [((results[i][key][0] - results[i - 1][key][0]) / results[i - 1][key][0] * 100).toFixed(2), results[i][key][1]];
              } else if (results[i - 1][key]) {
                obj[key] = [-100, null];
              } else {
                obj[key] = [100, results[i][key][1]];
              }
            }
            variationResults.push(obj);
          }

          data.line_chart_results = variationResults;
          data.table_results = tableResults(variationResults, institutionNames, 1);
          data.institution_names = underscore.sample(institutionNames, 5);
          data.type = 'percentage';
          data.additional_columns = additionalColumns;
          // console.log(data.line_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function variacionCarteraVigente(_x31, _x32, _x33) {return _ref11.apply(this, arguments);};})();

const variacionCarteraVencida = (() => {var _ref12 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const reportsSnapshot = yield db.collection('reports').
        where('status', '==', 'Aceptado').
        where('reported_year', '>=', Number(formData.from_year) - 1).
        where('reported_year', '<=', Number(formData.to_year)).
        get();
        if (reportsSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let reports = reportsSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let userCache = {};
          let results = [];
          for (let i = formData.from_year - 1; i <= formData.to_year; i++) {
            let result = { reported_year: Number(i) };
            results.push(result);
          }
          const additionalColumns = [
          { name: 'Cartera Vencida', format: 'money' }];


          for (let i = 0; i < reports.length; i++) {
            let total_portfolio = 0;
            // if (reports[i].current_portfolio && reports[i].current_portfolio instanceof Array) {
            //   for (let j = 0; j < reports[i].current_portfolio.length; j++) {
            //     total_portfolio += Number(reports[i].current_portfolio[j].amount);
            //   }
            // }
            if (reports[i].pastdue_portfolio && reports[i].pastdue_portfolio instanceof Array) {
              for (let j = 0; j < reports[i].pastdue_portfolio.length; j++) {
                total_portfolio += Number(reports[i].pastdue_portfolio[j].amount);
              }
            }
            // if (reports[i].execution_portfolio && reports[i].execution_portfolio instanceof Array) {
            //   for (let j = 0; j < reports[i].execution_portfolio.length; j++) {
            //     total_portfolio += Number(reports[i].execution_portfolio[j].amount);
            //   }
            // }

            let indicatorValue = total_portfolio;
            if (indicatorValue) {
              // console.log(indicatorValue);
              // indicatorValue = indicatorValue.toFixed(2);
              if (userCache[reports[i].user_id]) {
                results[reports[i].reported_year - formData.from_year + 1][userCache[reports[i].user_id]] = [indicatorValue, total_portfolio];
              } else {
                const userRecord = yield admin.auth().getUser(reports[i].user_id);
                userCache[reports[i].user_id] = userRecord.displayName;
                results[reports[i].reported_year - formData.from_year + 1][userCache[reports[i].user_id]] = [indicatorValue, total_portfolio];
              }
            }
          }

          let institutionNames = [];
          Object.keys(userCache).forEach(function (key) {return institutionNames.push(userCache[key]);});

          let variationResults = [];
          for (let i = 1; i < results.length; i++) {
            const obj = { reported_year: Number(results[i].reported_year) };
            for (let j = 0; j < institutionNames.length; j++) {
              let key = institutionNames[j];
              if (results[i][key] && results[i - 1][key]) {
                obj[key] = [((results[i][key][0] - results[i - 1][key][0]) / results[i - 1][key][0] * 100).toFixed(2), results[i][key][1]];
              } else if (results[i - 1][key]) {
                obj[key] = [-100, null];
              } else {
                obj[key] = [100, results[i][key][1]];
              }
            }
            variationResults.push(obj);
          }

          data.line_chart_results = variationResults;
          data.table_results = tableResults(variationResults, institutionNames, 1);
          data.institution_names = underscore.sample(institutionNames, 5);
          data.type = 'percentage';
          data.additional_columns = additionalColumns;
          // console.log(data.line_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function variacionCarteraVencida(_x34, _x35, _x36) {return _ref12.apply(this, arguments);};})();

const carteraVigenteNivel = (() => {var _ref13 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const level = formData.level;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const reportsSnapshot = yield db.collection('reports').
        where('status', '==', 'Aceptado').
        where('reported_year', '>=', Number(formData.from_year)).
        where('reported_year', '<=', Number(formData.to_year)).
        get();
        if (reportsSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let reports = reportsSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let userCache = {};
          let results = [];
          for (let i = formData.from_year; i <= formData.to_year; i++) {
            let result = { reported_year: Number(i) };
            results.push(result);
          }
          const additionalColumns = [
          { name: 'Cartera Vigente', format: 'money' }];


          for (let i = 0; i < reports.length; i++) {
            let current_portfolio = 0;
            let level_portfolio = 0;
            let pregrado_portfolio = 0;
            let posgrado_portfolio = 0;
            if (reports[i].current_portfolio && reports[i].current_portfolio instanceof Array) {
              for (let j = 0; j < reports[i].current_portfolio.length; j++) {
                current_portfolio += Number(reports[i].current_portfolio[j].amount);
                if (reports[i].current_portfolio[j].name === level + '_pais' ||
                reports[i].current_portfolio[j].name === level + '_exterior') {
                  level_portfolio += Number(reports[i].current_portfolio[j].amount);
                } else {
                  if (reports[i].current_portfolio[j].name === 'pregrado_pais' ||
                  reports[i].current_portfolio[j].name === 'pregrado_exterior') {
                    pregrado_portfolio += Number(reports[i].current_portfolio[j].amount);
                  } else if (reports[i].current_portfolio[j].name === 'posgrado_pais' ||
                  reports[i].current_portfolio[j].name === 'posgrado_exterior') {
                    posgrado_portfolio += Number(reports[i].current_portfolio[j].amount);
                  }
                }
              }
            }

            if (level === 'todos') {
              let pregradoIndicator = pregrado_portfolio / current_portfolio * 100;
              let posgradoIndicator = posgrado_portfolio / current_portfolio * 100;
              if (pregradoIndicator && posgradoIndicator) {
                pregradoIndicator = pregradoIndicator.toFixed(2);
                posgradoIndicator = posgradoIndicator.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [pregradoIndicator, posgradoIndicator, current_portfolio];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [pregradoIndicator, posgradoIndicator, current_portfolio];
                }
              }
            } else {
              let indicatorValue = level_portfolio / current_portfolio * 100;
              if (indicatorValue) {
                // console.log(indicatorValue);
                indicatorValue = indicatorValue.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, current_portfolio];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, current_portfolio];
                }
              }
            }
          }

          let institutionNames = [];
          Object.keys(userCache).forEach(function (key) {return institutionNames.push(userCache[key]);});

          data.line_chart_results = results;
          if (level === 'todos') {
            data.table_results = tableResults(results, institutionNames, 3);
            data.indicator_labels = ['Posgrado'];
          } else {
            data.table_results = tableResults(results, institutionNames, 2);
          }
          data.institution_names = underscore.sample(institutionNames, 5);
          data.type = 'percentage';
          data.first_indicator_label = 'Pregrado';
          data.level = level;
          data.additional_columns = additionalColumns;
          // console.log(data.line_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function carteraVigenteNivel(_x37, _x38, _x39) {return _ref13.apply(this, arguments);};})();

const carteraVigenteLugar = (() => {var _ref14 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const place = formData.place;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const reportsSnapshot = yield db.collection('reports').
        where('status', '==', 'Aceptado').
        where('reported_year', '>=', Number(formData.from_year)).
        where('reported_year', '<=', Number(formData.to_year)).
        get();
        if (reportsSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let reports = reportsSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let userCache = {};
          let results = [];
          for (let i = formData.from_year; i <= formData.to_year; i++) {
            let result = { reported_year: Number(i) };
            results.push(result);
          }
          const additionalColumns = [
          { name: 'Cartera Vigente', format: 'money' }];


          for (let i = 0; i < reports.length; i++) {
            let current_portfolio = 0;
            let place_portfolio = 0;
            let pais_portfolio = 0;
            let exterior_portfolio = 0;
            if (reports[i].current_portfolio && reports[i].current_portfolio instanceof Array) {
              for (let j = 0; j < reports[i].current_portfolio.length; j++) {
                current_portfolio += Number(reports[i].current_portfolio[j].amount);
                if (reports[i].current_portfolio[j].name === 'pregrado_' + place ||
                reports[i].current_portfolio[j].name === 'posgrado_' + place) {
                  place_portfolio += Number(reports[i].current_portfolio[j].amount);
                } else {
                  if (reports[i].current_portfolio[j].name === 'pregrado_pais' ||
                  reports[i].current_portfolio[j].name === 'posgrado_pais') {
                    pais_portfolio += Number(reports[i].current_portfolio[j].amount);
                  } else if (reports[i].current_portfolio[j].name === 'pregrado_exterior' ||
                  reports[i].current_portfolio[j].name === 'posgrado_exterior') {
                    exterior_portfolio += Number(reports[i].current_portfolio[j].amount);
                  }
                }
              }
            }

            if (place === 'todos') {
              let paisIndicator = pais_portfolio / current_portfolio * 100;
              let exteriorIndicator = exterior_portfolio / current_portfolio * 100;
              if (paisIndicator && exteriorIndicator) {
                paisIndicator = paisIndicator.toFixed(2);
                exteriorIndicator = exteriorIndicator.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [paisIndicator, exteriorIndicator, current_portfolio];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [paisIndicator, exteriorIndicator, current_portfolio];
                }
              }
            } else {
              let indicatorValue = place_portfolio / current_portfolio * 100;
              if (indicatorValue) {
                // console.log(indicatorValue);
                indicatorValue = indicatorValue.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, current_portfolio];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, current_portfolio];
                }
              }
            }
          }

          let institutionNames = [];
          Object.keys(userCache).forEach(function (key) {return institutionNames.push(userCache[key]);});

          data.line_chart_results = results;
          if (place === 'todos') {
            data.table_results = tableResults(results, institutionNames, 3);
            data.indicator_labels = ['Exterior'];
          } else {
            data.table_results = tableResults(results, institutionNames, 2);
          }
          data.institution_names = underscore.sample(institutionNames, 5);
          data.type = 'percentage';
          data.first_indicator_label = 'País';
          data.place = place;
          data.additional_columns = additionalColumns;
          // console.log(data.line_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function carteraVigenteLugar(_x40, _x41, _x42) {return _ref14.apply(this, arguments);};})();

const carteraVigenteGenero = (() => {var _ref15 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const sex = formData.sex;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const reportsSnapshot = yield db.collection('reports').
        where('status', '==', 'Aceptado').
        where('reported_year', '>=', Number(formData.from_year)).
        where('reported_year', '<=', Number(formData.to_year)).
        get();
        if (reportsSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let reports = reportsSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let userCache = {};
          let results = [];
          for (let i = formData.from_year; i <= formData.to_year; i++) {
            let result = { reported_year: Number(i) };
            results.push(result);
          }
          const additionalColumns = [
          { name: 'Cartera Vigente', format: 'money' }];


          for (let i = 0; i < reports.length; i++) {
            let current_portfolio = reports[i].current_portfolio_pregrado_male + reports[i].current_portfolio_pregrado_female +
            reports[i].current_portfolio_posgrado_male + reports[i].current_portfolio_posgrado_female;
            let female_portfolio = reports[i].current_portfolio_pregrado_female + reports[i].current_portfolio_posgrado_female;
            let male_portfolio = reports[i].current_portfolio_pregrado_male + reports[i].current_portfolio_posgrado_male;

            if (sex === 'todos') {
              let femaleIndicator = female_portfolio / current_portfolio * 100;
              let maleIndicator = male_portfolio / current_portfolio * 100;
              if (femaleIndicator && maleIndicator) {
                femaleIndicator = femaleIndicator.toFixed(2);
                maleIndicator = maleIndicator.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [femaleIndicator, maleIndicator, current_portfolio];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [femaleIndicator, maleIndicator, current_portfolio];
                }
              }
            } else {
              let indicatorValue;
              if (sex === 'femenino')
              indicatorValue = female_portfolio / current_portfolio * 100;else

              indicatorValue = male_portfolio / current_portfolio * 100;
              if (indicatorValue) {
                // console.log(indicatorValue);
                indicatorValue = indicatorValue.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, current_portfolio];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, current_portfolio];
                }
              }
            }
          }

          let institutionNames = [];
          Object.keys(userCache).forEach(function (key) {return institutionNames.push(userCache[key]);});

          data.line_chart_results = results;
          if (sex === 'todos') {
            data.table_results = tableResults(results, institutionNames, 3);
            data.indicator_labels = ['Masculino'];
          } else {
            data.table_results = tableResults(results, institutionNames, 2);
          }
          data.institution_names = underscore.sample(institutionNames, 5);
          data.type = 'percentage';
          data.first_indicator_label = 'Femenino';
          data.sex = sex;
          data.additional_columns = additionalColumns;
          // console.log(data.line_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function carteraVigenteGenero(_x43, _x44, _x45) {return _ref15.apply(this, arguments);};})();

const carteraVencida = (() => {var _ref16 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const reportsSnapshot = yield db.collection('reports').
        where('status', '==', 'Aceptado').
        where('reported_year', '>=', Number(formData.from_year)).
        where('reported_year', '<=', Number(formData.to_year)).
        get();
        if (reportsSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let reports = reportsSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let userCache = {};
          let results = [];
          for (let i = formData.from_year; i <= formData.to_year; i++) {
            let result = { reported_year: Number(i) };
            results.push(result);
          }
          const additionalColumns = [
          { name: 'Cartera Vencida', format: 'money' }];


          for (let i = 0; i < reports.length; i++) {
            let total_portfolio = 0;
            let pastdue_portfolio = 0;
            if (reports[i].current_portfolio && reports[i].current_portfolio instanceof Array) {
              for (let j = 0; j < reports[i].current_portfolio.length; j++) {
                total_portfolio += Number(reports[i].current_portfolio[j].amount);
              }
            }
            if (reports[i].pastdue_portfolio && reports[i].pastdue_portfolio instanceof Array) {
              for (let j = 0; j < reports[i].pastdue_portfolio.length; j++) {
                total_portfolio += Number(reports[i].pastdue_portfolio[j].amount);
                pastdue_portfolio += Number(reports[i].pastdue_portfolio[j].amount);
              }
            }
            if (reports[i].execution_portfolio && reports[i].execution_portfolio instanceof Array) {
              for (let j = 0; j < reports[i].execution_portfolio.length; j++) {
                total_portfolio += Number(reports[i].execution_portfolio[j].amount);
              }
            }

            let indicatorValue = pastdue_portfolio / total_portfolio * 100;
            if (indicatorValue) {
              // console.log(indicatorValue);
              indicatorValue = indicatorValue.toFixed(2);
              if (userCache[reports[i].user_id]) {
                results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_portfolio];
              } else {
                const userRecord = yield admin.auth().getUser(reports[i].user_id);
                userCache[reports[i].user_id] = userRecord.displayName;
                results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_portfolio];
              }
            }
          }

          let institutionNames = [];
          Object.keys(userCache).forEach(function (key) {return institutionNames.push(userCache[key]);});

          data.line_chart_results = results;
          data.table_results = tableResults(results, institutionNames, 2);
          data.institution_names = underscore.sample(institutionNames, 5);
          data.type = 'percentage';
          data.additional_columns = additionalColumns;
          // console.log(data.line_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function carteraVencida(_x46, _x47, _x48) {return _ref16.apply(this, arguments);};})();

const carteraVencidaNivel = (() => {var _ref17 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const level = formData.level;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const reportsSnapshot = yield db.collection('reports').
        where('status', '==', 'Aceptado').
        where('reported_year', '>=', Number(formData.from_year)).
        where('reported_year', '<=', Number(formData.to_year)).
        get();
        if (reportsSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let reports = reportsSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let userCache = {};
          let results = [];
          for (let i = formData.from_year; i <= formData.to_year; i++) {
            let result = { reported_year: Number(i) };
            results.push(result);
          }
          const additionalColumns = [
          { name: 'Cartera Vigente', format: 'money' }];


          for (let i = 0; i < reports.length; i++) {
            let pastdue_portfolio = 0;
            let level_portfolio = 0;
            let pregrado_portfolio = 0;
            let posgrado_portfolio = 0;
            if (reports[i].pastdue_portfolio && reports[i].pastdue_portfolio instanceof Array) {
              for (let j = 0; j < reports[i].pastdue_portfolio.length; j++) {
                pastdue_portfolio += Number(reports[i].pastdue_portfolio[j].amount);
                if (reports[i].pastdue_portfolio[j].name === level + '_pais' ||
                reports[i].pastdue_portfolio[j].name === level + '_exterior') {
                  level_portfolio += Number(reports[i].pastdue_portfolio[j].amount);
                } else {
                  if (reports[i].pastdue_portfolio[j].name === 'pregrado_pais' ||
                  reports[i].pastdue_portfolio[j].name === 'pregrado_exterior') {
                    pregrado_portfolio += Number(reports[i].pastdue_portfolio[j].amount);
                  } else if (reports[i].pastdue_portfolio[j].name === 'posgrado_pais' ||
                  reports[i].pastdue_portfolio[j].name === 'posgrado_exterior') {
                    posgrado_portfolio += Number(reports[i].pastdue_portfolio[j].amount);
                  }
                }
              }
            }

            if (level === 'todos') {
              let pregradoIndicator = pregrado_portfolio / pastdue_portfolio * 100;
              let posgradoIndicator = posgrado_portfolio / pastdue_portfolio * 100;
              if (pregradoIndicator && posgradoIndicator) {
                pregradoIndicator = pregradoIndicator.toFixed(2);
                posgradoIndicator = posgradoIndicator.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [pregradoIndicator, posgradoIndicator, pastdue_portfolio];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [pregradoIndicator, posgradoIndicator, pastdue_portfolio];
                }
              }
            } else {
              let indicatorValue = level_portfolio / pastdue_portfolio * 100;
              if (indicatorValue) {
                // console.log(indicatorValue);
                indicatorValue = indicatorValue.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, pastdue_portfolio];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, pastdue_portfolio];
                }
              }
            }
          }

          let institutionNames = [];
          Object.keys(userCache).forEach(function (key) {return institutionNames.push(userCache[key]);});

          data.line_chart_results = results;
          if (level === 'todos') {
            data.table_results = tableResults(results, institutionNames, 3);
            data.indicator_labels = ['Posgrado'];
          } else {
            data.table_results = tableResults(results, institutionNames, 2);
          }
          data.institution_names = underscore.sample(institutionNames, 5);
          data.type = 'percentage';
          data.first_indicator_label = 'Pregrado';
          data.level = level;
          data.additional_columns = additionalColumns;
          // console.log(data.line_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function carteraVencidaNivel(_x49, _x50, _x51) {return _ref17.apply(this, arguments);};})();

const carteraVencidaLugar = (() => {var _ref18 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const place = formData.place;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const reportsSnapshot = yield db.collection('reports').
        where('status', '==', 'Aceptado').
        where('reported_year', '>=', Number(formData.from_year)).
        where('reported_year', '<=', Number(formData.to_year)).
        get();
        if (reportsSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let reports = reportsSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let userCache = {};
          let results = [];
          for (let i = formData.from_year; i <= formData.to_year; i++) {
            let result = { reported_year: Number(i) };
            results.push(result);
          }
          const additionalColumns = [
          { name: 'Cartera Vigente', format: 'money' }];


          for (let i = 0; i < reports.length; i++) {
            let pastdue_portfolio = 0;
            let place_portfolio = 0;
            let pais_portfolio = 0;
            let exterior_portfolio = 0;
            if (reports[i].pastdue_portfolio && reports[i].pastdue_portfolio instanceof Array) {
              for (let j = 0; j < reports[i].pastdue_portfolio.length; j++) {
                pastdue_portfolio += Number(reports[i].pastdue_portfolio[j].amount);
                if (reports[i].pastdue_portfolio[j].name === 'pregrado_' + place ||
                reports[i].pastdue_portfolio[j].name === 'posgrado_' + place) {
                  place_portfolio += Number(reports[i].pastdue_portfolio[j].amount);
                } else {
                  if (reports[i].pastdue_portfolio[j].name === 'pregrado_pais' ||
                  reports[i].pastdue_portfolio[j].name === 'posgrado_pais') {
                    pais_portfolio += Number(reports[i].pastdue_portfolio[j].amount);
                  } else if (reports[i].pastdue_portfolio[j].name === 'pregrado_exterior' ||
                  reports[i].pastdue_portfolio[j].name === 'posgrado_exterior') {
                    exterior_portfolio += Number(reports[i].pastdue_portfolio[j].amount);
                  }
                }
              }
            }

            if (place === 'todos') {
              let paisIndicator = pais_portfolio / pastdue_portfolio * 100;
              let exteriorIndicator = exterior_portfolio / pastdue_portfolio * 100;
              if (paisIndicator && exteriorIndicator) {
                paisIndicator = paisIndicator.toFixed(2);
                exteriorIndicator = exteriorIndicator.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [paisIndicator, exteriorIndicator, pastdue_portfolio];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [paisIndicator, exteriorIndicator, pastdue_portfolio];
                }
              }
            } else {
              let indicatorValue = place_portfolio / pastdue_portfolio * 100;
              if (indicatorValue) {
                // console.log(indicatorValue);
                indicatorValue = indicatorValue.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, pastdue_portfolio];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, pastdue_portfolio];
                }
              }
            }
          }

          let institutionNames = [];
          Object.keys(userCache).forEach(function (key) {return institutionNames.push(userCache[key]);});

          data.line_chart_results = results;
          if (place === 'todos') {
            data.table_results = tableResults(results, institutionNames, 3);
            data.indicator_labels = ['Exterior'];
          } else {
            data.table_results = tableResults(results, institutionNames, 2);
          }
          data.institution_names = underscore.sample(institutionNames, 5);
          data.type = 'percentage';
          data.first_indicator_label = 'País';
          data.place = place;
          data.additional_columns = additionalColumns;
          // console.log(data.line_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function carteraVencidaLugar(_x52, _x53, _x54) {return _ref18.apply(this, arguments);};})();

const carteraVencidaGenero = (() => {var _ref19 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const sex = formData.sex;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const reportsSnapshot = yield db.collection('reports').
        where('status', '==', 'Aceptado').
        where('reported_year', '>=', Number(formData.from_year)).
        where('reported_year', '<=', Number(formData.to_year)).
        get();
        if (reportsSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let reports = reportsSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let userCache = {};
          let results = [];
          for (let i = formData.from_year; i <= formData.to_year; i++) {
            let result = { reported_year: Number(i) };
            results.push(result);
          }
          const additionalColumns = [
          { name: 'Cartera Vigente', format: 'money' }];


          for (let i = 0; i < reports.length; i++) {
            let pastdue_portfolio = reports[i].pastdue_portfolio_pregrado_male + reports[i].pastdue_portfolio_pregrado_female +
            reports[i].pastdue_portfolio_posgrado_male + reports[i].pastdue_portfolio_posgrado_female;
            let female_portfolio = reports[i].pastdue_portfolio_pregrado_female + reports[i].pastdue_portfolio_posgrado_female;
            let male_portfolio = reports[i].pastdue_portfolio_pregrado_male + reports[i].pastdue_portfolio_posgrado_male;

            if (sex === 'todos') {
              let femaleIndicator = female_portfolio / pastdue_portfolio * 100;
              let maleIndicator = male_portfolio / pastdue_portfolio * 100;
              if (femaleIndicator && maleIndicator) {
                femaleIndicator = femaleIndicator.toFixed(2);
                maleIndicator = maleIndicator.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [femaleIndicator, maleIndicator, pastdue_portfolio];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [femaleIndicator, maleIndicator, pastdue_portfolio];
                }
              }
            } else {
              let indicatorValue;
              if (sex === 'femenino')
              indicatorValue = female_portfolio / pastdue_portfolio * 100;else

              indicatorValue = male_portfolio / pastdue_portfolio * 100;
              if (indicatorValue) {
                // console.log(indicatorValue);
                indicatorValue = indicatorValue.toFixed(2);
                if (userCache[reports[i].user_id]) {
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, pastdue_portfolio];
                } else {
                  const userRecord = yield admin.auth().getUser(reports[i].user_id);
                  userCache[reports[i].user_id] = userRecord.displayName;
                  results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, pastdue_portfolio];
                }
              }
            }
          }

          let institutionNames = [];
          Object.keys(userCache).forEach(function (key) {return institutionNames.push(userCache[key]);});

          data.line_chart_results = results;
          if (sex === 'todos') {
            data.table_results = tableResults(results, institutionNames, 3);
            data.indicator_labels = ['Masculino'];
          } else {
            data.table_results = tableResults(results, institutionNames, 2);
          }
          data.institution_names = underscore.sample(institutionNames, 5);
          data.type = 'percentage';
          data.first_indicator_label = 'Femenino';
          data.sex = sex;
          data.additional_columns = additionalColumns;
          // console.log(data.line_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function carteraVencidaGenero(_x55, _x56, _x57) {return _ref19.apply(this, arguments);};})();

const empleadoBeneficiario = (() => {var _ref20 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const reportsSnapshot = yield db.collection('reports').
        where('status', '==', 'Aceptado').
        where('reported_year', '>=', Number(formData.from_year)).
        where('reported_year', '<=', Number(formData.to_year)).
        get();
        if (reportsSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let reports = reportsSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let userCache = {};
          let employeesCache = {};
          let results = [];
          for (let i = formData.from_year; i <= formData.to_year; i++) {
            let result = { reported_year: Number(i) };
            results.push(result);
          }
          const additionalColumns = [
          { name: 'Total Beneficiarios', format: 'number' },
          { name: 'Total Empleados', format: 'number' }];


          for (let i = 0; i < reports.length; i++) {
            let total_students = 0;
            let total_employees = 0;
            if (employeesCache[reports[i].user_id]) {
              total_employees = employeesCache[reports[i].user_id];
            } else {
              const usersSnapshot = yield db.collection('users').
              where('user_id', '==', reports[i].user_id).
              get();
              try {
                if (usersSnapshot.size > 1) {
                  console.log('Error: ', 'Duplicate user profile document');
                  data.error = 'Error de información duplicada. Contacte al administrador';
                } else {
                  const institution = usersSnapshot.docs[0].data();
                  userCache[reports[i].user_id] = institution.name;
                  employeesCache[reports[i].user_id] = Number(institution.employees);
                  total_employees = Number(institution.employees);
                }
              } catch (error) {
                console.log("Error: ", error);
                data.error = "Error al consultar datos del usuario";
              }
            }
            if (reports[i].programs && reports[i].programs instanceof Array) {
              for (let j = 0; j < reports[i].programs.length; j++) {
                const program = reports[i].programs[j];
                if (program.beneficiaries)
                total_students += Number(program.beneficiaries);
              }
            }

            let indicatorValue = total_students / total_employees;
            if (indicatorValue) {
              // console.log(indicatorValue);
              indicatorValue = indicatorValue.toFixed(2);
              if (userCache[reports[i].user_id]) {
                results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_students, total_employees];
              } else {
                const userRecord = yield admin.auth().getUser(reports[i].user_id);
                userCache[reports[i].user_id] = userRecord.displayName;
                results[reports[i].reported_year - formData.from_year][userCache[reports[i].user_id]] = [indicatorValue, total_students, total_employees];
              }
            }
          }

          let institutionNames = [];
          Object.keys(userCache).forEach(function (key) {return institutionNames.push(userCache[key]);});

          data.line_chart_results = results;
          data.table_results = tableResults(results, institutionNames, 3);
          data.institution_names = underscore.sample(institutionNames, 5);
          data.type = 'number';
          data.additional_columns = additionalColumns;
          // console.log(data.line_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function empleadoBeneficiario(_x58, _x59, _x60) {return _ref20.apply(this, arguments);};})();

const plataformaTecnologica = (() => {var _ref21 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const usersSnapshot = yield db.collection('users').
        get();
        if (usersSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let users = usersSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let results = [];
          for (let i = 0; i < users.length; i++) {
            if (users[i].name && users[i].has_platform) {
              let result = {
                institution_name: users[i].name,
                indicators: [{ reported_year: '¿Cuenta con Plataforma Tecnológica?', values: [users[i].has_platform] }] };

              results.push(result);
            }
          }

          // data.line_chart_results = results;
          data.table_results = results;
          // data.institution_names = ['si', 'no'];
          // data.type = 'percentage';
          // console.log(data.line_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function plataformaTecnologica(_x61, _x62, _x63) {return _ref21.apply(this, arguments);};})();

const regulacion = (() => {var _ref22 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const usersSnapshot = yield db.collection('users').
        get();
        if (usersSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let users = usersSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let results = [];
          for (let i = 0; i < users.length; i++) {
            if (users[i].name && users[i].regulated) {
              let result = {
                institution_name: users[i].name,
                indicators: [{ reported_year: '¿Está la ICE regulada?', values: [users[i].regulated, users[i].regulating_entity] }] };

              results.push(result);
            }
          }
          const additionalColumns = [
          { name: 'Entidad Reguladora', format: 'text' }];


          // data.line_chart_results = results;
          data.table_results = results;
          // data.institution_names = ['si', 'no'];
          // data.type = 'percentage';
          data.additional_columns = additionalColumns;
          // console.log(data.line_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function regulacion(_x64, _x65, _x66) {return _ref22.apply(this, arguments);};})();

const calificacion = (() => {var _ref23 = (0, _asyncToGenerator3.default)(function* (req, res, data) {
    const formData = req.body;
    const years = formData.to_year - formData.from_year + 1;
    if (years >= 0 && years <= 10) {
      try {
        const usersSnapshot = yield db.collection('users').
        get();
        if (usersSnapshot.empty) {
          console.log('No documents found.');
          data.warning = 'No hay datos reportados en el periodo seleccionado.';
        } else {
          let users = usersSnapshot.docs.map(function (doc) {return doc.data();});
          // console.log(reports);
          let results = [];
          for (let i = 0; i < users.length; i++) {
            if (users[i].name && users[i].credit_rating) {
              let result = {
                institution_name: users[i].name,
                indicators: [{ reported_year: '¿Cuenta la ICE con calificación crediticia?',
                  values: [users[i].credit_rating, users[i].rating_agency] }] };

              results.push(result);
            }
          }
          const additionalColumns = [
          { name: 'Agencia Calificadora', format: 'text' }];


          // data.line_chart_results = results;
          data.table_results = results;
          // data.institution_names = ['si', 'no'];
          // data.type = 'percentage';
          data.additional_columns = additionalColumns;
          // console.log(data.line_chart_results, data.table_results);
        }
        return res.render('select-report', data);
      } catch (error) {
        console.log('Error: ', error);
        data.error = 'No se han podido recuperar los datos de la institución. Contacte al administrador.';
        return res.render('select-report', data);
      }
    } else {
      data.error = 'Rango de años invalido. (0 <= rango <= 10)';
      return res.render('select-report', data);
    }
  });return function calificacion(_x67, _x68, _x69) {return _ref23.apply(this, arguments);};})();

const tableResults = (chartResults, institutionNames, indicatorsLength) => {
  let tableResults = [];
  for (let i = 0; i < institutionNames.length; i++) {
    let result = { institution_name: institutionNames[i], indicators: [] };
    for (let j = 0; j < chartResults.length; j++) {
      let indicator = { reported_year: chartResults[j].reported_year };
      const indicatorValues = chartResults[j][result.institution_name];
      indicator.values = [];
      for (let k = 0; k < indicatorsLength; k++) {
        indicator.values.push(null);
      }
      if (indicatorValues) {
        indicator.values = indicatorValues;
      }
      // console.log(indicator);
      result.indicators.push(indicator);
    }
    tableResults.push(result);
  }

  return tableResults;
};

const getFinancingSource = code => {
  switch (code) {
    case 'gubernamental':{
        return 'Recursos Gubernamentales';
      }
    case 'privado':{
        return 'Recursos Privados';
      }
    case 'nacional':{
        return 'Créditos Nacionales';
      }
    case 'internacional':{
        return 'Créditos Internacionales';
      }
    case 'donaciones':{
        return 'Donaciones y Filantropía';
      }
    case 'cartera':{
        return 'Recuperación de la Cartera / Cobranza';
      }
    case 'terceros':{
        return 'Administración de Recursos de terceros';
      }
    case 'cooperacion':{
        return 'Fondos de Cooperación';
      }
    case 'impuestos':{
        return 'Impuestos, Tasas y Contribuciones';
      }
    case 'titularizacion':{
        return 'Titularización';
      }
    case 'propios':{
        return 'Recursos Propios';
      }
    case 'inversiones':{
        return 'Inversiones';
      }
    case 'otra':{
        return 'Otra';
      }
    default:{
        return 'error';
      }}

};