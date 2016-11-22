/**
 * ����� ValidationService ���� ������� � �������� ����, �������������� ������� ��������.
 * ���� ������� �� ��`���� markers � ����� ��������� �� ����, �� ���������� ��������, � ����� ��������� ��������, ��������� ������ ���� ��� ��������� ���� � �.�.
 * ��������� �� ���� ����� ������� � ����� aField_ID ������� �� ����� ���� ����� ($name). �� ��������� ���'����� ������ �������� � �������� � ����� �����, ���. @setValidatorByMarker.
 * ������ �� ������������ �������� sMessage - ����������� ��� ������� �������� ��� �����������. TODO: ���������
 *
 * г�� ������� ������ ������������ ����� � ��� �� ����� �����.
 * �������� ����� ���� ����� ���� �������� (NumberBetween_1, NumberBetween_Floor_Subs, NumberBetween_MaxBlocks � �.�.)
 *
 * ��������� ������ ����������� ���� ������ (� ��������� motion �� ����� ��������). TODO: ��������� �� ���.
 * ������ ����������� ������� (�� � � motion)
 * ��������� �� ������������� �������� ���� ���� ��������. TODO: ��������, �� �� ��� ������� ��������� ����� ����� ���� ���.
 *
 * ������ ����� �� ��������: i/issues/375, 654 �� 685.
 */

angular.module('iGovMarkers').service('ValidationService', ['moment', 'amMoment', 'angularMomentConfig', 'iGovMarkers', ValidationService])
  .constant('angularMomentConfig', {
    preprocess: 'utc',
    timezone: 'Europe/Kiev',
    format: 'HH:mm:ss, YYYY-MM-DD'
  });

// TODO .value('defaultDateFormat', 'YYYY-MM-DD' );

function ValidationService(moment, amMoment, angularMomentConfig, MarkersFactory) {

  this.markers = MarkersFactory.getMarkers();

  var self = this;

  self.sFormat = 'YYYY-MM-DD';
  self.oFormDataParams = null;

  // �� ��� ����, ��� ������ ���� � ����������� ������.
  // FIXME: ������� �������� locale
  (moment.locale || moment.lang)('uk');
  amMoment.changeLocale('uk');

  self.getValidationMarkers = function () {
    return self.markers;
  };

  /**
   * �������� ����� ��������. �������� ��������� ����� ����� form (�� ������� ���� � ��������� markers),
   * � ����� ��������� ����� ��������, ���� �������� immediateValidation === true;
   *
   * ���������:
   * @param form - �����, ��� ����� ��������� �� ��������� ��������. ����'������� ��������.
   * @param {object} markers - ������� ��������. ������'������� ��������. ���� �� �������, �� ��������� ������� �� �������������, ���. _resolveValidationMarkers
   * @param {boolean} immediateValidation - ������'�������, �����, �� ����� ��������� ����� �������� ������ ���� ����������� ���������.
   * @param (object) data - ������'�������, ��� ����������, ���� ��������, �� ��������� �������������, �� ����������� �������� ������ �������� ��������� � ���������� modelValue �� viewValue
   * @param {boolean} newRow - ������'�������, ��������������� ��� �������� ������i ��� ��������i ������ �����
   */
  self.validateByMarkers = function (form, markers, immediateValidation, data, newRow) {

    // ���� ������� �������� ������� ���� - �� ����������� ��
    function _resolveValidationMarkers(markers) {
      if (markers) {
        self.markers = markers;
      }
      return self.markers;
    }

    markers = _resolveValidationMarkers(markers);

    // ���� ������� - ���� ���������. �������� � �������
    if (!markers || !markers.validate || markers.validate.length < 1) {
      return;
    }

    // �������� � �������� �� ����� ��� �������, ���� �������� data �� ����������, formData �� ����� ����� ��������� � undefined
    // � ���� ������
    if (data) {
      self.oFormDataParams = data || {};
    }

    angular.forEach(markers.validate, function (marker, markerName) {
      /*
      var isOrganJoinInclude = false;
      var isOrganNoInclude = true;
      for(var nFieldID = 0; nFieldID < marker.aField_ID.length; nFieldID++){
        if (marker.aField_ID[nFieldID] === "sID_Public_SubjectOrganJoin"){
          isOrganJoinInclude = true;
        }
        if (marker.aField_ID[nFieldID] === "organ"){
          isOrganNoInclude = false;
        }
      }
      if(isOrganJoinInclude && isOrganNoInclude){
        marker.aField_ID.push("organ");
        if(self.oFormDataParams.sID_Public_SubjectOrganJoin){
          marker.original = self.oFormDataParams.sID_Public_SubjectOrganJoin;
        }
      }
*/
      angular.forEach(form, function (formField) {

        self.setValidatorByMarker(marker, markerName, formField, immediateValidation, false, newRow);
      });
    });
  };

  self.trimMarkerName = function(markerName){
    if (markerName.indexOf('CustomFormat_') == 0)
      markerName = 'CustomFormat'; //in order to use different format rules at the same time
    if (markerName.indexOf('FileExtensions_') == 0) {
      markerName = 'FileExtensions';
    }
    if (markerName.indexOf('FieldNotEmptyAndNonZero_') == 0) {
      markerName = 'FieldNotEmptyAndNonZero';
    }
    if (markerName.indexOf('NumberBetween_') == 0) {
      markerName = 'NumberBetween';
    }
    if (markerName.indexOf('NumberFractionalBetween_') == 0) {
      markerName = 'NumberFractionalBetween';
    }
    if (markerName.indexOf('Numbers_Accounts_') == 0) {
      markerName = 'Numbers_Accounts';
    }
    return markerName;
  };

  self.setValidatorByMarker = function (marker, markerName, formField, immediateValidation, forceValidation, newRow) {

    markerName = self.trimMarkerName(markerName);

    var keyByMarkerName = self.validatorNameByMarkerName[markerName];
    var fieldNameIsListedInMarker = formField && formField.$name && _.indexOf(marker.aField_ID, formField.$name) !== -1;
    var existingValidator = formField && formField.$validators && formField.$validators[keyByMarkerName];

    // ��� ���� ����� ��������� �������� � �������, ����� ��������� �� �����, �������� ��� ��������.
    if(!fieldNameIsListedInMarker) {
      angular.forEach(formField, function (field) {
        if(typeof field === 'object') {
          if(newRow) field = formField;
          angular.forEach(field, function (table) {
            angular.forEach(table, function (tableField) {
              if (tableField && tableField.$name) {
                for(var i=0; i<marker.aField_ID.length; i++){
                  if(tableField.$name.indexOf(marker.aField_ID[i]) !== -1) {
                    var keyByMarkerName = self.validatorNameByMarkerName[markerName];
                    var fieldNameIsListedInMarker = tableField;
                    var existingValidator = tableField && tableField.$validators && tableField.$validators[keyByMarkerName];
                    if ((fieldNameIsListedInMarker /* || forceValidation */ ) && !existingValidator) {
                      var markerOptions = angular.copy(marker) || {};
                      if (marker.aField_ID && !tableField.$name.indexOf(marker.aField_ID[i]) > -1) marker.aField_ID.push(tableField.$name)
                      markerOptions.key = keyByMarkerName;
                      if (!tableField.$validators) return true;
                      tableField.$validators[keyByMarkerName] = self.getValidatorByName(markerName, markerOptions, tableField);
                      if (immediateValidation === true) tableField.$validate();
                      if (markerOptions.inheritedValidator && typeof markerOptions.inheritedValidator === 'string') {
                        self.setValidatorByMarker(marker, markerOptions.inheritedValidator, tableField, immediateValidation, true);
                      }
                    } else if (fieldNameIsListedInMarker && existingValidator) {
                      if (immediateValidation === true) tableField.$validate();
                    }
                  }
                  break
                }
              }
            })
          });
        }
      })
    }
    // ������������ �������� Angular - ����� ��� ����, �� ��������� � ������ ��������, � ����� ���� ���.
    if ((fieldNameIsListedInMarker /* || forceValidation */ ) && !existingValidator) {

      // �����'������� ����� ������� ��� �������� ��������� ���� sMessage, sFormat, bFuture, bLess, nDays ���.
      var markerOptions = angular.copy(marker) || {};
      markerOptions.key = keyByMarkerName;

      // TODO �� ���� ������ �� ���������� $validators ��-�� ���� ����� ������, �������
      if(!formField.$validators) {
        return true
      }

      formField.$validators[keyByMarkerName] = self.getValidatorByName(markerName, markerOptions, formField);

      // ...� ��������� ����� ��������, ���� �����
      if (immediateValidation === true) {
        formField.$validate();
      }

      // ��������� �����������
      if (markerOptions.inheritedValidator && typeof markerOptions.inheritedValidator === 'string') {
        // ����������� �������� ��������
        self.setValidatorByMarker(marker, markerOptions.inheritedValidator, formField, immediateValidation, true);
      }
    } else if (fieldNameIsListedInMarker && existingValidator) {
      if (immediateValidation === true) {
        formField.$validate();
      }
    }
  };

  // �� ��������� ����� ��� ����������� ������� �������� � UI
  // @todo FIXME �� �������, ����� ������� ���� �������� ������� ��������
  self.validatorNameByMarkerName = {
    Mail: 'email',
    AutoVIN: 'autovin',
    PhoneUA: 'tel',
    TextUA: 'textua',
    TextRU: 'textru',
    DateFormat: 'dateformat',
    DateElapsed: 'dateelapsed',
    CodeKVED: 'CodeKVED',
    CodeEDRPOU: 'CodeEDRPOU',
    CodeMFO: 'CodeMFO',
    NumberBetween: 'numberbetween',
    NumberFractionalBetween: 'numberfractionalbetween',
    Numbers_Accounts: 'numbersaccounts',
    DateElapsed_1: 'dateofbirth',
    CustomFormat: 'CustomFormat',
    FileSign: 'FileSign',
    FileExtensions: 'FileExtensions',
    FieldNotEmptyAndNonZero: 'FieldNotEmptyAndNonZero'
  };

  /**
   * �������� ��������� �������-��������� �� ������ ������� ��������
   * @param {string} markerName ����� ������� �������� � ��'���� markers
   * @param {object} markerOptions ����� ������� ��������, ����������� � �������-��������
   * @param formField - ���� �����, ��� ������ ��������� ����� ��������, ������`������� ��������.
   * @returns {function|null} �������-��������� ��� null ��� ���������� ��������� (����� ������, �� �� ����������� �� ����� markerName).
   */
  self.getValidatorByName = function (markerName, markerOptions, formField) {
    var fValidator = self.validatorFunctionsByFieldId[markerName];
    // ��������� ��� ���������� �����
    var validationClosure = function (modelValue, viewValue) {
      var result = null;
      // �������� ����� ��� ���������
      var savedOptions = markerOptions || {};
      if (fValidator) {
        result = fValidator.call(self, modelValue, viewValue, savedOptions);
        // ���� �������� ����� ������� � savedOptions.lastError, �� ����������� �� ���� �����
        if (formField && formField.$error && savedOptions.lastError) {
          formField.lastErrorMessage = savedOptions.lastError;
        }
      }
      if(result === null){
        result = true;
      }
      return result;
    };
    return validationClosure;
  };

  /** ��`��� � �������� �������-���������.
   @todo ���������� ��������� ��������� ��� ������� ������ (��������� �������, ���� ������������).
   */
  self.validatorFunctionsByFieldId = {
    /**
     * 'Mail' - �������� ������ ���������� �����
     */
    'Mail': function (modelValue, viewValue) {
      var bValid = true;
      var EMAIL_REGEXP = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
      bValid = bValid && EMAIL_REGEXP.test(modelValue);
      return bValid;
    },

    /**
     * 'AutoVIN' - ������: ����� �� 17 ��������.
     * ��������� ������������ ��� �������� ����� � ��������� ����� (� � C D F � G � J � L N � � R S � V W U X Y Z),
     * �� ����������� ���� Q, O, I. (��� ����� ��������� ��� �������������, ��������� O � Q ������ ����� �����, � I � O ����� ������� � 0 � 1.)
     */
    'AutoVIN': function (sValue) {
      if (!sValue) {
        return false;
      }

      var bValid = true;
      bValid = bValid && (sValue !== null);
      bValid = bValid && (sValue.length === 17);
      bValid = bValid && (/^[a-zA-Z0-9]+$/.test(sValue));
      bValid = bValid && (sValue.indexOf('q') < 0 && sValue.indexOf('o') < 0 && sValue.indexOf('i') < 0);
      bValid = bValid && (sValue.indexOf('Q') < 0 && sValue.indexOf('O') < 0 && sValue.indexOf('I') < 0);
      return bValid;
    },

    'PhoneUA': null,

    /**
     * 'TextUA' - �� ������� �����, ��� ����, �������� ���� (�����) �� �����
     * ����� �������: '����� ���� ������ ���� �������� ����� ��� ���� �� �����'
     */
    'TextUA': function (modelValue, viewValue) {
      if (modelValue === null || modelValue === '') {
        return true;
      }
      var TEXTUA_REGEXP = /^[����å�Ū��Ȳ�����������������������������賿��������������������`'-\s]+$/g;
      var TEXTRU_ONLY = /[��������]+/g;
      var bValid = TEXTUA_REGEXP.test(modelValue) && !TEXTRU_ONLY.test(modelValue);
      return bValid;
    },

    /**
     * 'TextRU' - �� ������� �����, ��� ����, �������� ���� (�����) �� �����
     * ����� �������: '����� ���� ������ ���� ������� ����� ��� ���� �� �����'
     */
    'TextRU': function (modelValue, viewValue) {
      if (modelValue === null || modelValue === '') {
        return true;
      }
      var TEXTRU_REGEXP = /^[�����������娸����������������������������������������������������-\s]+$/g;
      var TEXTUA_ONLY = /[��������]+/g;
      var bValid = TEXTRU_REGEXP.test(modelValue) && !TEXTUA_ONLY.test(modelValue);
      return bValid;
    },

    /**
     * 'DateFormat' - ���� � �������� ������ DATE_FORMAT
     * ����� �������: '���� ���� ���� ����� ������� DATE_FORMAT'
     * ��� �������� ������� ���������������  moment.js
     */
    'DateFormat': function (modelValue, viewValue, options) {
      if (!options || !options.sFormat) {
        return false;
      }

      // ������ �������c�� (�������� - var bValid = moment(modelValue, options.sFormat).isValid())
      var bValid = (moment(modelValue, options.sFormat).format(options.sFormat) === modelValue);

      if (bValid === false) {
        options.lastError = options.sMessage || ('���� ���� ���� ����� ������� ' + options.sFormat);
      }

      return bValid;
    },

      //test

    'DocumentDate': function (modelValue, viewValue, options) {
      if (!options || !options.sFormat) {
        return false;
      }

      var bValid = (moment(modelValue, options.sFormat).format(options.sFormat) === modelValue);

      if (bValid === false) {
        options.lastError = options.sMessage || ('���� ���� ���� ����� ������� ' + options.sFormat);
      }

      return bValid;
    },

    /**
     * 'DateElapsed' - �/�� ���� � ��� �/���� �������, �����/����� ���/������/����
     *
     *  ���������:
     *  bFuture: false,  // ���� true, �� ���� modelValue �� ���� � �����������
     *  bLess: true,     // ���� true, �� '������' �� modelValue �� ����� �� ���� '����� ��' ������� ������ �����������
     *  nDays: 3,
     *  nMonths: 0,
     *  nYears: 1,
     *  sFormat: 'YYYY-MM-DD'
     *
     * ����� �������: '³�/�� ���� ��/���� ����������� �� ���� �����/����� �� �-���, �-������, �-����.
     * �-___        - ���������� �����, ���� x �� ������� 0
     * �/��         - � ��������� �� bFuture
     * �����/����� - � ��������� �� bLess
     */
    'DateElapsed': function (modelValue, viewValue, options) {

      // bFuture, bLess, nDays, nMonths, nYears
      var o = options;
      var bValid = true;
      var errors = [];
      var now = moment();
      var fmt = self.sFormat || options.sFormat;
      var modelMoment = moment(modelValue, fmt);

      // if (o.bDebug) {
      //   console.log((o.sDebug ? o.sDebug : '') + ' - �����: ' + now.format(fmt) + ', �� �����: ' + modelMoment.format(fmt) + ', ������: ' + deltaDays);
      // }

      options.lastError = '';

      // ��������� �������, ���� ����� �� ������ ��� ���� ��������:
      if (!o || typeof o.bFuture === 'undefined' || !modelMoment.isValid()) {
        return false;
      }

      var nDays = o.nDays || 0;
      var nMonths = o.nMonths || 0;
      var nYears = o.nYears || 0;

      // ��������� ������ �� ������
      var deltaDays = modelMoment.diff(now, 'days');
      var deltaMonths = modelMoment.diff(now, 'months');
      var deltaYears = modelMoment.diff(now, 'years');

      // myLog('DateElapsed: ', o);

      // ��������, �� ���������� bFuture (���� �� ���� � �����������):
      var errorSuffix;

      if (o.bFuture === true && deltaDays < 1) {
        addError('���� �� ���� � �����������, � �� � ' + (deltaDays === 0 ? '�' : getRealDeltaStr(true)));
        bValid = false;
      } else if (o.bFuture === false && deltaDays >= 1) {
        addError('���� �� ���� � ��������, � �� � ' + (deltaDays === 0 ? '�' : getRealDeltaStr()));
        bValid = false;
      }

      function finalize() {
        // �������� ����������� ��� ������� � ���������� ��'��� ����� - ���������
        for (var errorName in errors) {
          // myLog(errors[errorName], 1);
          o.lastError = o.sMessage || errors[errorName];
        }
      }

      // ���� ��� � ������� - ��������� �������, ��� ��������� ���� �����:
      if (bValid === false) {
        finalize();
        // myLog('-------------break ---------------', 2);
        return bValid;
      }

      // ���� ����� ����� ���� - ��������� ���-�
      if (typeof o.bLess === 'undefined') {
        return bValid;
      }

      addError(getErrorMessage());

      finalize();

      return bValid;

      // ������� �������:

      // �������� ����������� ��� �������
      function getErrorMessage() {
        // VID_DO: ³�/��
        var sVidDo = o.bFuture ? '��' : '³�';
        // DO_PISLYA: ��/����
        var sDoPislya = o.bFuture ? '����' : '��';
        // BIL_MEN: �����/�����
        var sBilMen = o.bLess ? '�����' : '�����';

        var maxDelta = moment.duration({
          days: nDays,
          months: nMonths,
          years: nYears
        }).as('days');

        var message = '{VID_DO} ���� � ��� {DO_PISLYA} ������� �� ���� {BIL_MEN} �� {N_DAYS} {N_MONTHES} {N_YEARS}'; // - max Delta = ' + maxDelta

        // delta ������� ������ - � o.bLess ����, �� �� ���� �����:
        // TODO test it more
        if (o.bLess === true && Math.abs(deltaDays) > maxDelta || o.bLess === false && Math.abs(deltaDays) < maxDelta) {
          bValid = false;
          message = '' + message
              .replace('{VID_DO}', sVidDo)
              .replace('{DO_PISLYA}', sDoPislya)
              .replace('{BIL_MEN}', sBilMen)
              .replace('{N_DAYS}', self.pluralize(nDays, 'days'))
              .replace('{N_MONTHES}', self.pluralize(nMonths, 'months'))
              .replace('{N_YEARS}', self.pluralize(nYears, 'years'));
        } else {
          message = null;
        }
        return message;
      }

      // ������������� ������ ����������� �������:
      function getAlternativeErrorMessage() {
        return [
          '���� �� ���� � ',
          '' + (o.bFuture ? '�����������' : '��������'),
          ' �� ���������� ',
          '' + (o.bLess ? '�����' : '�����'),
          ', �� �� ' + getDeltaStr(options)
        ].join('');
      }

      function addError(msg) {
        if (msg) {
          errors.push(msg);
        }
      }

      // ������������� Moment ��� ��������� ����� ���� "�� ����", "�� ��� ��" etc.
      function getRealDeltaStr(getFrom) {
        return getFrom ? modelMoment.from(now) : modelMoment.to(now);
      }

      function getDeltaStr() {
        var d = self.pluralize(nDays, 'days');
        var m = self.pluralize(nMonths, 'months');
        var y = self.pluralize(nYears, 'years');
        return (d ? d : '') + (m ? ', ' + m : '') + (y ? ', ' + y : '');
      }

      // TODO disable in release - it's dev only
      // function myLog(sMessage, l) {
      //   // ��� ������ �����, ��� ����� ���� � ������
      //   var logLevel = 1;
      //   if (l <= logLevel) {
      //     console.log('\t\t' + sMessage);
      //   }
      // }
    },

    /**
     ������: ��� ����� ����� ��� ����� (������ ��� ����� �� ����� ���� 04, 34, 40, 44, 48, 54, 57, 67, 76, 83, 89)
     ���������: ������ ���� �� ���� - (�� �� ������ ��������� �����)
     */
    'CodeKVED': function (sValue) { //��� ������������� ������������ �� ����.

      if (!sValue) {
        return false;
      }

      var bValid = true;
      bValid = bValid && (sValue !== null);
      bValid = bValid && (sValue.trim().length === 5);
      bValid = bValid && (sValue.trim().substr(2, 1) === '.');
      var s = bValid ? sValue.trim().substr(0, 2) : '';
      bValid = bValid && (s !== '04' && s !== '34' && s !== '40' &&
        s !== '44' && s !== '48' && s !== '54' && s !== '57' &&
        s !== '67' && s !== '76' && s !== '83' && s !== '89');

      // console.log('Validate CodeKVED: ', sValue, ' is valid: ' + bValid);
      //bValid = bValid && (/^[a-zA-Z0-9]+$/.test(sValue));
      //bValid = bValid && (sValue.indexOf('q') < 0 && sValue.indexOf('o') < 0 && sValue.indexOf('i') < 0);
      //bValid = bValid && (sValue.indexOf('Q') < 0 && sValue.indexOf('O') < 0 && sValue.indexOf('I') < 0);
      return bValid;
    },

    /**
     11) EDRPOU //��� ������.
     ������: ������ ������ ����, ��� ������(����� ����� ���� ������� default=� �)
     ���������: ����� ��� ������ �� ���� - (�� �� ������ ��������� �����)
     ����: edrpou
     */
    'CodeEDRPOU': function (sValue) { //��� ������������� ������������ �� ����.

      if (!sValue) {
        return false;
      }

      var bValid = true;
      bValid = bValid && (sValue !== null);
      bValid = bValid && (sValue.trim().length === 8);
      /* bValid = bValid && (sValue.trim().substr(2,1) === '.');
       var s=bValid ? sValue.trim().substr(0,2) : "";
       bValid = bValid && (s !== '04' && s !== '34' && s !== '40'
       && s !== '44' && s !== '48' && s !== '54' && s !== '57'
       && s !== '67' && s !== '76' && s !== '83' && s !== '89');
       */
      // console.log('Validate CodeEDRPOU: ', sValue, ' is valid: ' + bValid);
      //bValid = bValid && (/^[a-zA-Z0-9]+$/.test(sValue));
      //bValid = bValid && (sValue.indexOf('q') < 0 && sValue.indexOf('o') < 0 && sValue.indexOf('i') < 0);
      //bValid = bValid && (sValue.indexOf('Q') < 0 && sValue.indexOf('O') < 0 && sValue.indexOf('I') < 0);

      return bValid;
    },

    /**
     12) MFO //��� �����.
     ������: ������ ����� ����.��� ������.(����� ����� ���� ������� default=� �)
     ���������: ������ ���� ����� �� ���� - (�� �� ������ ��������� �����)
     ����: mfo
     */
    'CodeMFO': function (sValue) { //��� ������������� ������������ �� ����.

      if (!sValue) {
        return false;
      }

      var bValid = true;
      bValid = bValid && (sValue !== null);
      bValid = bValid && (sValue.trim().length === 6);
      /*var s=bValid ? sValue.trim().substr(0,2) : "";
       bValid = bValid && (s !== '04' && s !== '34' && s !== '40'
       && s !== '44' && s !== '48' && s !== '54' && s !== '57'
       && s !== '67' && s !== '76' && s !== '83' && s !== '89');
       */
      // console.log('Validate CodeMFO: ', sValue, ' is valid: ' + bValid);
      //bValid = bValid && (/^[a-zA-Z0-9]+$/.test(sValue));
      //bValid = bValid && (sValue.indexOf('q') < 0 && sValue.indexOf('o') < 0 && sValue.indexOf('i') < 0);
      //bValid = bValid && (sValue.indexOf('Q') < 0 && sValue.indexOf('O') < 0 && sValue.indexOf('I') < 0);

      return bValid;
    },

    /**
     'NumberBetween' - ����� �����, �������� 3
     ����� �������: options.sMessage ��� '����� �� ���� �� ' + options.nMin + ' �� ' + options.nMax;
     ������ �������:
     NumberBetween: { // ������������� �����
        aField_ID: ['floors'],
        nMin: 1,
        nMax: 3,
        sMessage: ''
      }
     */
    'NumberBetween': function (modelValue, viewValue, options) {
      if (modelValue === null || modelValue === '') {
        return true;
      }
      if (!options || options.nMin === null || options.nMax === null) {
        return false;
      }
      var DIGITS_REGEXP = /^\d+$/;
      var bValid = DIGITS_REGEXP.test(modelValue) && modelValue >= options.nMin && modelValue <= options.nMax;

      if (bValid === false) {
        options.lastError = options.sMessage || ('�������� ����������� ���������� - ����� �� ���� �� ' + options.nMin + ' �� ' + options.nMax);
      }

      return bValid;
    },

    /**
     ������ �������:
     NumberFractionalBetween: { //������� ����� �����
        aField_ID: ['total_place', 'warming_place'],
        nMin: 0,
        nMax: 99999999
      }
     ������: ��������� ������ �����, �������� 8
     ���������: ��������� ������������ ���������� ���� - ������� ��������� ����� �������� �������� �� 8 ����
     */
    'NumberFractionalBetween': function (modelValue, viewValue, options) {
      if (modelValue === null || modelValue === '') {
        return true;
      }
      if (!options || options.nMin === null || options.nMax === null) {
        return false;
      }

      var FRACTIONAL_REGEXP = /^[0-9]+[\.?[0-9]*]?$/;
      var bValid = FRACTIONAL_REGEXP.test(modelValue) && modelValue >= options.nMin && modelValue <= options.nMax;

      if (bValid === false) {
        options.lastError = options.sMessage || ('�������� ����������� ���������� ���� - ����� ���� ���������� �������� � ' + options.nMax + ' ����');
      }
      return bValid;
    },

    /**
     ������ �������:
     Numbers_Accounts: { //��������� ����� � ������, ����� ����� ���������
        aField_ID: ['house_number', 'gas_number', 'coolwater_number', 'hotwater_number', 'waterback_number', 'warming_number', 'electricity_number', 'garbage_number']
      }
     ������: ��������� ����� � ������, ����� ����� ���������
     ���������: ��������� ������������ ��������� ������ (����� �� ��������� � ����������)
     */
    'Numbers_Accounts': function (modelValue, viewValue, options) {
      if (modelValue === null || modelValue === '') {
        return true;
      }
      if (!options) {
        return false;
      }

      var DIGITS_AND_DASH_REGEXP = /^[\d+\-*]*\d+$/g;
      var bValid = DIGITS_AND_DASH_REGEXP.test(modelValue);

      if (bValid === false) {
        options.lastError = options.sMessage || ('�������� ����������� ��������� ������ (��������������� ����� �� �����)');
      }
      return bValid;
    },

    /**
     'CustomFormat' - ��������� ������ ������
     ����� �������: '������� ����������� �����, ������ ����������� ����� � ������ ����������:��:���:����'
     ������ �������:
     CustomFormat_NumberKadastr: {
        aField_ID: ['landNumb'],
        sFormat: '����������:��:���:����'
        sMessage: '������� ����������� �����, ������ ����������� ����� � ������ ����������:��:���:����'
     }
     �������� ���������� �� ��������� ������������ ������: id: landNumb type: string ������:
     10 ����:2 �����:3 �����:4 ����� (����������:��:���:����)
     ��� ������������ �������� �������� ������ "������� ����������� �����,
     ������ ����������� ����� � ������ ����������:��:���:����"
     }*/
    'CustomFormat': function (modelValue, viewValue, options) {
      console.log("viewValue=" + viewValue);
      if (modelValue === null || modelValue === '' || modelValue === undefined) {
        return true;
      }
      var bValid = true;

      console.log("modelValue=" + modelValue);
      if (bValid && (!options || options.sFormat === null)) {
        //return false;
        bValid = false;
      }
      console.log("options.sFormat=" + options.sFormat);
      var sValue = modelValue.trim();
      console.log("sValue=" + sValue);
      if (bValid && options.sFormat.length !== sValue.length) {
        //return false;
        bValid = false;
      }

      var nCount = sValue.length;
      console.log("nCount=" + nCount);
      var n = 0;
      while (bValid && n < nCount) {
        console.log("n=" + n);
        var s = sValue.substr(n, 1);
        console.log("s=" + s);
        var sF = options.sFormat.substr(n, 1);
        console.log("sF=" + sF);
        var b = false;
        if (sF === "#") {//�//#
          b = (s === "0" || s === "1" || s === "2" || s === "3" || s === "4" || s === "5" || s === "6" || s === "7" || s === "8" || s === "9");
        } else {
          b = (s === sF);
        }
        console.log("b=" + b);
        if (!b) {
          bValid = false;
          break;
        }
        n++;
      }
      console.log("bValid=" + bValid);
      //if (bValid === false) {
      if (!bValid) {
        options.lastError = options.sMessage || ('������� �����, ������ ����� � ������ ' + options.sFormat);
      }
      return bValid;
    },

    'FileSign': function (modelValue, viewValue, options) {
      var bValid = true;
      if (modelValue && !modelValue.signInfo && !modelValue.fromDocuments) {
        bValid = false;
      }

      if (bValid === false) {
        options.lastError = options.sMessage || ('ϳ���� �� ������� ��� �������');
      }
      return bValid;
    },

    /**
     * ��������� �������� ���������� ������������ �����
     * ������ �������:
     * FileExtensions_ExtValue: {
        aField_ID: ['bankId_scan_inn','file1','file2'],
        saExtension: 'jpg, pdf, png',
        sMessage: '������������ ������ �����! ������� ����: {saExtension}!'
      }
     */
    'FileExtensions': function (modelValue, viewValue, options) {
      console.log("viewValue=" + viewValue);
      if (modelValue === null || modelValue === '') {
        return true;
      }
      var bValid = true;

      console.log("modelValue=" + modelValue);
      if (bValid && (!options || options.saExtension === null)) {
        bValid = false;
      }
      console.log("options.saExtension=" + options.saExtension);

      var sFileName = "";

      var params = self.oFormDataParams;
      for(var paramObj in params) if (params.hasOwnProperty(paramObj)){
        if(params[paramObj].value && params[paramObj].fileName){
          if(modelValue.id === params[paramObj].value.id){
            sFileName = params[paramObj].fileName;
            break;
          } else if (modelValue.id === params[paramObj].value) {
            sFileName = params[paramObj].fileName;
            break;
          }
        }
      }

      var aExtensions = options.saExtension.split(',');
      for(var convertedItem = 0; convertedItem < aExtensions.length; convertedItem++){
        aExtensions[convertedItem] = $.trim(aExtensions[convertedItem]);
        aExtensions[convertedItem].toLowerCase();
      }

      /* old validate algorithm
      var ext = sFileName.split('.').pop().toLowerCase();
      for (var checkingItem = 0; checkingItem < aExtensions.length; checkingItem++){
        if (ext === aExtensions[checkingItem]){
          bValid = true;
          break;
        } else {
          bValid = false;
        }
      }
      */

      // start new validate algorithm
      var sReversFileName = "";
      for (var charInd = sFileName.length - 1; charInd >= 0; charInd--){
        sReversFileName = sReversFileName + sFileName.charAt(charInd);
      }
      for (var checkingItem = 0; checkingItem < aExtensions.length; checkingItem++){
        var bCharValid = true;
        for(var chInd = 0; chInd < aExtensions[checkingItem].length; chInd++){
          if(bCharValid == true && sReversFileName.charAt(chInd).toLowerCase() === aExtensions[checkingItem].charAt((aExtensions[checkingItem].length - 1) - chInd).toLowerCase()){
            bCharValid = true;
          } else {
            bCharValid = false;
            break;
          }
        }
        if (bCharValid){
          bValid = true;
          break;
        } else {
          bValid = false;
        }
      }
      // end new validate algorithm

      console.log("bValid=" + bValid);

      if (!bValid) {
        if (!options.sMessage || options.sMessage === null || options.sMessage === "") {
          options.sMessage = '������������ ������ �����! ������� ����: {saExtension}!';
        }
        var sMessage = MarkersFactory.interpolateString(options.sMessage, options, '{', '}');
        options.lastError = sMessage.value;
      }
      return bValid;
    },
    
    /**
     ������: �� �������� � �� ����
     */
    'FieldNotEmptyAndNonZero': function (modelValue) {
      var sValue = modelValue;
      var oSubjectOrganJoin = this.oFormDataParams.sID_Public_SubjectOrganJoin;

      // if(options.original){
      sValue = oSubjectOrganJoin.value;

      if(modelValue == null || modelValue == "" && !oSubjectOrganJoin.required){
        return true
      }
      if (!sValue) {
        return false;
      }

      var bValid = true;
      bValid = bValid && (sValue !== null);
      bValid = bValid && (sValue!==null && sValue.trim() !== "");
      bValid = bValid && (sValue!==null && sValue.trim() !== "0");
      return bValid;
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // ������
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  self.fromDateToDate = function (dateA, dateB, fmt) {
    var sFormat = fmt ? fmt : self.sFormat;
    return moment(dateA, sFormat).from(moment(dateB, sFormat));
  };

  /**
   * ���������� ����� nUnits �� ���� sKey �� ����� ��� ��:
   * - 1 ����, 2 ��, 5 ���,
   * - 1 �����, 3 �����, 10 ������
   * - 1 ��, 4 ����, 5 ����
   * @param {number} nUnits ������� ���, ������ �� ����, �� ����� �������� �� �������
   * @param {string} sKey ����� ������� ����� ����: ����, ����� �� ��.
   * @returns {string} �������� ����� �� ������ "5 ���", "2 ����" � �.�.
   */
  self.pluralize = function (nUnits, sKey) {
    var types = {
      'days': {
        single: '����',
        about: '��',
        multiple: '���'
      },
      'months': {
        single: '�����',
        about: '�����',
        multiple: '������'
      },
      'years': {
        single: '��',
        about: '����',
        multiple: '����'
      }
    };
    var sPluralized = nUnits === 0 ? '' : Math.abs(nUnits) === 1 ? types[sKey].single : Math.abs(nUnits) < 5 ? types[sKey].about : types[sKey].multiple;
    sPluralized = sPluralized === '' ? '' : Math.abs(nUnits) + ' ' + sPluralized;
    return sPluralized;
  };

  /**
   * What is it? Check here: http://planetcalc.ru/2464/
   */
  this.getLunaValue = function (id) {

    // TODO: Fix Alhoritm Luna
    // Number 2187501 must give CRC=3
    // Check: http://planetcalc.ru/2464/
    // var inputNumber = 3;

    var n = parseInt(id);

    //var n = parseInt(2187501);

    var nFactor = 1;
    var nCRC = 0;
    var nAddend;

    while (n !== 0) {
      nAddend = Math.round(nFactor * (n % 10));
      nFactor = (nFactor === 2) ? 1 : 2;
      nAddend = nAddend > 9 ? nAddend - 9 : nAddend;
      nCRC += nAddend;
      n = parseInt(n / 10);
    }

    nCRC = nCRC % 10;

    // console.log(nCRC%10);
    // nCRC=Math.round(nCRC/10)
    // console.log(nCRC%10);
    // console.log(nCRC);

    return nCRC;

  };

}