/**
 * @name Dominion Set Generator
 *
 * @fileOverview Generates sets for the card game Dominion.
 *
 * Copyright 2012, Wei-Hwa Huang
 * Licensed for use by Funsockets, Inc.
 * Ask Wei-Hwa for other licensing information.  If you can't figure out how to
 * ask Wei-Hwa, you're not allowed to use this code.
 *
 * Unimplemented but coming soon features:
 * <ul>
 *  <li> Consider previous card sets
 *  <li> Add data for Guilds
 *  <li> Allow user to ban specific cards
 *  <li> Canonicalize card names?
 * </ul>
 *
 * Warning: requires dominionSetGeneratorData.js to be loaded !
 *
 * Last update: 2012-12-21
 *
 * @version 1.3.3
 * @author Wei-Hwa Huang
 */

/**
 * Creates a unit of DominionSetGeneratorAttributeData.
 * A DominionSetGeneratorAttributeData is sort of like a 'parameter' for the
 * set picker.  It has four numeric values, and a 'Notes' section.
 *
 * @class
 * @constructor
 * @param {Number} min The 'minimum' threshhold: If this is undefined,
 *   we create an attribute with the default values of (0,0,1,1,'Unused').
 * @param {Number} max The 'maximum' threshhold.
 * @param {Number} minW Weight for the 'minimum' threshhold.
 * @param {Number} maxW Weight for the 'maximum' threshhold.
 * @param {String} notes The 'notes' section.
 */
function DominionSetGeneratorAttributeData(min, max, minW, maxW, notes) {
  if (min === undefined) {
    this.min = 0;
    this.max = 0;
    this.minW = 1;
    this.maxW = 1;
    this.notes = 'Unused';
  } else {
    this.min = min;
    this.max = max;
    this.minW = minW;
    this.maxW = maxW;
    this.notes = notes;
  }
}

/**
 * Creates a unit of DominionKingdom.
 * A DominionKingdom is a selection of cards for use in playing Dominion.
 *
 * @class
 * @constructor
 */
function DominionKingdom() {
  this.maxSetSize = 10;
  this.cardset = new Object();    // the current set of cards so far.
  this.useShelters = false;       // default values
  this.platinumColony = false;
  this.useSheltersDonline = false;       // default values
  this.platinumColonyDonline = false;
  this.youngWitchBane = 'Cellar';
}

/**
 * Clear the current set.
 *
 */
DominionKingdom.prototype.clearKingdom = function() {
  this.cardset = new Object();
};

/**
 * Get a random card from the kingdom (uniformly).
 *
 * @private
 * @return {String} The card returned.
 */
DominionKingdom.prototype.randCard_ = function() {
  var setSize = Object.keys(this.cardset).length;
  var randValue = Math.floor(setSize * Math.random());
  for (var card in this.cardset) {
    if (randValue == 0) {
      return card;
    }
    randValue--;
  }
  // shouldn't get here
  throw ('Error in randCardInSet: ' + setSize + ' ' + randValue);
};

/**
 * Creates a DominionSetGenerator.  The same SetGenerator can be used to
 * generate multiple sets.
 *
 * @constructor
 */
function DominionSetGenerator() {

  this.weight = new Object();     // weight of each card; changes a lot
  this.commentary = new Object(); // explanation of the weights
  this.owned = new Object();      // cards owned. Object, keys are cardnames.

  this.tMin = new Object();
  this.tMax = new Object();
  this.tMinW = new Object();
  this.tMaxW = new Object();
  this.tNotes = new Object();
  this.isDefault = new Object();  // for each attribute (key), true if
                                  // we should use the default value,
                                  // false if we should use the user-supplied
                                  // (t) value.
  this.sgd = DominionSetGeneratorData;  // convenience assignment
  this.balanceFactor = 1.0;       // how much to weight the overall effect
                                  // of default values.

  this.coreKingdom = new DominionKingdom();

  for (attr in this.sgd.Min) {
    this.isDefault[attr] = true;
  }

  this.logData = new Array();
}

/**
 * Should we use shelters in this game?
 * Note that this only changes when the set is regenerated.
 * The official rules don't specify what to do when there are
 * more than 10 cards in the set (such as for veto mode), so
 * we calculate it based on all the cards in the set (but not
 * the Bane for the Young Witch).  Note that this means it is
 * theoretically possible for there to be shelters but no
 * Dark Ages cards in a veto game.
 *
 * @return {Boolean} Whether to use Shelters.
 */
DominionSetGenerator.prototype.getUseShelters = function() {
  return this.coreKingdom.useShelters;
};

/**
 * Should we have Platinum/Colony in this game?
 * Note that this only changes when the set is regenerated.
 * The official rules don't specify what to do when there are
 * more than 10 cards in the set (such as for veto mode), so
 * we calculate it based on all the cards in the set (but not
 * the Bane for the Young Witch).  Note that this means it is
 * theoretically possible for there to be Platinum/Colony but no
 * Prosperity cards in a veto game.
 *
 * @return {Boolean} Whether to use Platinum/Colony.
 */
DominionSetGenerator.prototype.getPlatinumColony = function() {
  return this.coreKingdom.platinumColony;
};

/**
 * Should we use shelters in this game?
 * Note that this only changes when the set is regenerated.
 * This uses "Donline rules", where the choice of whether to
 * use is based on the proportion of total cards owned.
 *
 * @return {Boolean} Whether to use Shelters.
 */
DominionSetGenerator.prototype.getUseSheltersDonline = function() {
  return this.coreKingdom.useSheltersDonline;
};

/**
 * Should we have Platinum/Colony in this game?
 * Note that this only changes when the set is regenerated.
 * This uses "Donline rules", where the choice of whether to
 * use is based on the proportion of total cards owned.
 *
 * @return {Boolean} Whether to use Platinum/Colony.
 */
DominionSetGenerator.prototype.getPlatinumColonyDonline = function() {
  return this.coreKingdom.platinumColonyDonline;
};

/**
 * What is the Bane for Young Witch?
 * Note that this only changes when the set is regenerated.
 * Also, sets that don't have a Young Witch still have a Bane
 * (in case it's needed for Black Market or some other weird card).
 *
 * @return {Boolean} Whether to use Shelters.
 */
DominionSetGenerator.prototype.getYoungWitchBane = function() {
  return this.coreKingdom.youngWitchBane;
};

/**
 * What is the Bane for Young Witch? (Goko format)
 * Note that this only changes when the set is regenerated.
 * Also, sets that don't have a Young Witch still have a Bane
 * (in case it's needed for Black Market or some other weird card).
 *
 * @return {Boolean} Whether to use Shelters.
 */
DominionSetGenerator.prototype.getYoungWitchBaneGoko = function() {
  var card = this.coreKingdom.youngWitchBane.toLowerCase()
              .replace(/(?:^|\s|\-)\S/g,
                function(a) { return a.toUpperCase(); })
              .replace(/\(.*\)/g, '')
              .replace(/\-\>.*/g, '')
              .replace(/[^a-zA-Z]/g, '');
  return (card.charAt(0).toLowerCase() + card.slice(1));
};

/**
 * Sets the effect strength of the "balanced" generator.
 * The default value is 1.0; set this to 0.0 to get a
 * generator that weights everything uniformly.  Set this
 * to a larger number to really exaggerate the selection
 * towards balanced sets, and set this to a negative number
 * to skew away from balanced sets.
 *
 * @param {Number} value The balance factor.
 */
DominionSetGenerator.prototype.setBalanceFactor = function(value) {
  this.balanceFactor = value;
};

/**
 * Gets the effect strength of the "balanced" generator.
 *
 * @return {Number} The balance factor.
 */
DominionSetGenerator.prototype.getBalanceFactor = function() {
  return this.balanceFactor;
};

/**
/**
 * Sets the size of the set to be generated.
 *
 * @private
 * @param {Number} value The size of the set to be generated.
 */
DominionSetGenerator.prototype.setMaxSetSize_ = function(value) {
  this.maxSetSize = value;
};

/**
 * Gets the size of the set to be generated.
 *
 * @return {Number} The size of the set to be generated.
 */
DominionSetGenerator.prototype.getMaxSetSize = function() {
  return this.maxSetSize;
};

/**
 * Gets the set that is currently being generated.
 * Note that
 * generateSet() returns the set anyway, so you might never need
 * to call this unless you need to see the same set again.
 *
 * @return {Object} The set of cards, in the form of an Object
 * where the keys are Strings with the names of cards.
 */
DominionSetGenerator.prototype.getCardset = function() {
  return (this.coreKingdom.cardset);
};

/**
 * Gets the set that is currently being generated, in Goko camelCase form.
 * Note that
 * generateSet() returns the set anyway, so you might never need
 * to call this unless you need to see the same set again.
 *
 * @return {Object} The set of cards, in the form of an Array
 * where the contents are Strings with the names of cards.
 */
DominionSetGenerator.prototype.getGokoCardset = function() {
  var answer = new Array();
  for (var card in this.coreKingdom.cardset) {
    var gcard = card.toLowerCase()
              .replace(/(?:^|\s|\-)\S/g,
                 function(a) { return a.toUpperCase(); })
              .replace(/\(.*\)/g, '')
              .replace(/\-\>.*/g, '')
              .replace(/[^a-zA-Z]/g, '');

    answer.push(gcard.charAt(0).toLowerCase() + gcard.slice(1));
  }
  return answer;
};

/**
 * Clears the internal log.
 */
DominionSetGenerator.prototype.clearLog = function() {
  this.logData = new Array();
};

/**
 * Gets the internal log.
 * @return {String} The internal log as one long string,
 * with internal line-breaks.
 */
DominionSetGenerator.prototype.getLog = function() {
  return this.logData.join('\n');
};

/**
 * Adds a line to the internal log.
 *
 * @private
 * @param {String} text The log line to add.
 */
DominionSetGenerator.prototype.log_ = function(text) {
  this.logData.push(text);
};

/**
 * Dumps the internal log to the Javascript Console (as multiple lines).
 */
DominionSetGenerator.prototype.dumpLogToConsole = function() {

  // Protection against the console not existing.
  if (!window.console) {
    (function() {
      var names = ['log', 'debug', 'info', 'warn', 'error',
          'assert', 'dir', 'dirxml', 'group', 'groupEnd', 'time',
          'timeEnd', 'count', 'trace', 'profile', 'profileEnd'],
          i, l = names.length;

      window.console = {};

      for (i = 0; i < l; i++) {
        window.console[names[i]] = function() {};
      }
    }());
  }

  for (var i = 0; i < this.logData.length; ++i) {
    window.console.log(this.logData[i]);
  }
};

/**
 * Logs a description of weights.
 *
 * @private
 * @param {Number} len Integer showing number of cards (on each end) to log.
 */
DominionSetGenerator.prototype.logWeights_ = function(len) {
  var threshhold = 0;
  var sorted = Object.keys(this.sgd.cardNames);
  var w = this.weight;
  sorted.sort(function(a, b) { return (w[b] - w[a]); });

  this.log_(' ... Top ' + len + ' weights:');
  for (var lcv = 0; lcv < len; ++lcv) {
    var card = sorted[lcv];
    this.log_(' ... ... ' + card + ' (' + this.weight[card] +
             ') [' + this.commentary[card] + ']');
    threshhold = this.weight[card];
  }
  var index = len;
  var ties = 0;
  while (this.weight[sorted[index]] == threshhold && index < sorted.length) {
    ties++;
    index++;
  }
  if (ties > 0) {
    this.log_(' ... ... and ' + ties + ' other' + ((ties == 1) ? '' : 's'));
  }

  this.log_(' ... Bottom ' + len + ' weights:');

  index = sorted.length - 1;
  while (this.weight[sorted[index]] == 0 && index >= 0) {
    index--;
  }
  var lcv;
  for (lcv = index; lcv >= index - len && lcv >= 0; --lcv) {
    var card = sorted[lcv];
    this.log_(' ... ... ' + card + ' (' + this.weight[card] +
              ') [' + this.commentary[card] + ']');
    threshhold = this.weight[card];
  }
  ties = 0;
  threshhold = this.weight[sorted[lcv]];
  while (this.weight[sorted[lcv]] == threshhold && lcv >= 0) {
    ties++;
    lcv--;
  }
  if (ties > 0) {
    this.log_(' ... ... and ' + ties + ' other' + ((ties == 1) ? '' : 's'));
  }
};

/**
 * Exponentiation convenience function.
 *
 * @private
 * @param {Number} base Base.
 * @param {Number} exp Exponent.
 * @return {Number} The power!
 */
DominionSetGenerator.prototype.power_ = function(base, exp) {
  return Math.exp(exp * Math.log(base));
};


/**
 * Finds a random card (with the current weights).
 * If the weights are weird enough that there's a problem, returns 'ERROR'.
 *
 * @private
 * @return {String} The name of the random card.
 */
DominionSetGenerator.prototype.randCard_ = function() {
  // returns a randomly-chosen card based on the current set of weights.
  var totalWeight = 0;
  for (var card in this.sgd.cardNames) {
    totalWeight += this.weight[card];
  }
  if (totalWeight < 0.00000001) {
    // Math.random might choke.  If stuff is this unpopular just
    // return the first valid card.
    for (var card in this.sgd.cardNames) {
      if (0 < this.weight[card]) {
        return card;
      }
    }
  } else {
    var randValue = totalWeight * Math.random();
    for (var card in this.sgd.cardNames) {
      if (randValue < this.weight[card]) {
        return card;
      } else {
        randValue -= this.weight[card];
      }
    }
  }
  return 'ERROR';
};

/**
 * For the supplied attribute, add up the values of that attribute for all
 * cards in the current set, and return that.
 *
 * @private
 * @param {DominionKingdom} kingdom The Kingdom to use.
 * @param {String} attribute The attribute to look at.
 * @return {Number} The sum of the values of the attribute in the given set.
 */
DominionSetGenerator.prototype.getCardsetValue_ = function(kingdom, 
                                                           attribute) {
  var answer = 0;
  for (var card in kingdom.cardset) {
    try {
      if (this.sgd.cardData[card][attribute] != undefined)
        answer += this.sgd.cardData[card][attribute];
    } catch (err) {
      throw this.logData + '\nCan\'t get attribute ' + attribute +
                           ' of ' + card;
    }
  }
  return answer;
};

/**
 * Calculate the correct multiplier for the given card, attribute pair.
 *
 * @private
 * @param {DominionKingdom} kingdom The Kingdom to use.
 * @param {String} card The card to calculate for.
 * @param {String} attribute The card to calculate for.
 * @param {Boolean} firstCard Is this the first card to be generated?
 * @return {Number} The calculated multiplier.
 */
DominionSetGenerator.prototype.calcBalanceMultiplier_ = function(kingdom,
                                               card, attribute, firstCard) {
  var value = this.sgd.cardData[card][attribute];
  if (value == undefined || value == 0) return 1.0;

  // for the first card, ignore any non-user-defined weights.
  if (firstCard && this.isDefault[attribute]) return 1.0;

  var answer = 1.0;
  var attData = this.getAttributeData(attribute);
  var cardsetValue = this.getCardsetValue_(kingdom, attribute);
  if (cardsetValue < attData.min) {
    var multiplier = attData.minW;
    answer *= multiplier;
  }
  if (cardsetValue + value > attData.max) {
    var multiplier = this.power_(attData.maxW, cardsetValue);
    answer *= multiplier;
  }
  return answer;
};


/**
 * Calculate the correct multiplier for the given card.
 * For each card, we only keep the most extreme multipliers using
 * the following algorithm:
 * (1) Sort all the multipliers.
 * (2) Look at the two multipliers at the ends.  If one is
 *   > 1.0 and one is < 1.0, keep both.
 * (3) After all that, keep the three most extreme ones.
 *
 * @private
 * @param {DominionKingdom} kingdom The Kingdom to use.
 * @param {String} card The card to calculate for.
 * @param {Boolean} firstCard Is this the first card to be generated?
 * @return {Number} The calculated multiplier.
 */
DominionSetGenerator.prototype.calcEffectiveMultiplier_ = function(kingdom,
                                                 card, firstCard) {
  // returns the appropriate multiplier for the card.
  var attList = new Array();
  var multipliers = new Object();
  for (var attribute in this.sgd.cardAttributes) {
    var multiplier = this.calcBalanceMultiplier_(kingdom, card, attribute,
                                                 firstCard);
    if (multiplier != 1.0) {
      attList.push(attribute);
      multipliers[attribute] = multiplier;
    }
  }
  attList.sort(function(a, b) {
    return (multipliers[b] - multipliers[a]);
  });

  var att;
  var weight = 1.0;
  while (attList.length > 0 && multipliers[attList[0]] > 1.0 &&
                       multipliers[attList[attList.length - 1]] < 1.0) {
    att = attList.shift();
    weight *= multipliers[att];
    this.commentary[card] += 'x' + multipliers[att] +
                             ' (' + att + '); ';
    att = attList.pop();
    weight *= multipliers[att];
    this.commentary[card] += 'x' + multipliers[att] +
                             ' (' + att + '); ';
  }

  var extra = 0;
  while (attList.length > 0 && extra < 3) {
    if (multipliers[attList[0]] > 1.0) {
      att = attList.shift();
    } else {
      att = attList.pop();
    }
    ++extra;
    weight *= multipliers[att];
    this.commentary[card] += 'x' + multipliers[att] +
                             ' (' + att + '); ';
  }

  this.commentary[card] += 'ignoring ' + attList.length + ' attribs :';

  while (attList.length > 0) {
    att = attList.shift();
    this.commentary[card] += 'x' + multipliers[att] +
                             ' (' + att + '); ';
  }

  if (isNaN(weight)) {
    this.log_('Error: NaN in ' + card + ' ' + this.commentary[card]);
  }

  if (weight > 1e+200) {
    return 1e+200;
  } else {
    return weight;
  }
};

/**
 * Calculate the correct weight for the given card.
 * Right now it's the same as the balance multiplier,
 * with chosen cards and unowned cards filtered out.
 * This will get more complex in a later version.
 *
 * @private
 * @param {DominionKingdom} kingdom The Kingdom to use.
 * @param {Object} candidates An object where the keys
 * are the permissible cards to use.
 * @param {String} card The card to calculate for.
 * @param {Boolean} firstCard Is this the first card to be generated?
 * @return {Number} The calculated weight.
 */
DominionSetGenerator.prototype.calcWeight_ = function(kingdom,
                                      candidates, card, firstCard) {
  if (card in kingdom.cardset) {
    return 0;  // already in set
  }

  if (!(card in candidates)) {
    return 0;  // can't use the card
  }

  return this.calcEffectiveMultiplier_(kingdom, card, firstCard);
};

/**
 * Update the weights for all the cards.
 *
 * @private
 * @param {DominionKingdom} kingdom The Kingdom to use.
 * @param {Object} candidates An object where the keys
 * are the permissible cards to use.
 * @param {Boolean} firstCard Is this the first card to be generated?
 */
DominionSetGenerator.prototype.updateWeights_ = function(kingdom,
                                         candidates, firstCard) {
  for (var card in this.sgd.cardNames) {
    this.commentary[card] = '';
    this.weight[card] = this.calcWeight_(kingdom, candidates, card, firstCard);
  }
};

/// externally visible functions

/**
 * Get the current data for the given attribute.
 *
 * @param {String} attr Which attribute to get.
 * @return {DominionSetGeneratorAttributeData} The data for the given attribute.
 */
DominionSetGenerator.prototype.getAttributeData = function(attr) {
  if (this.isDefault[attr]) {

    var min = this.sgd.Min[attr];
    var max = this.sgd.Max[attr];
    var minW = this.power_(this.sgd.MinW[attr], this.balanceFactor);
    var maxW = this.power_(this.sgd.MaxW[attr], this.balanceFactor);
    var notes = this.sgd.Notes[attr];

    // all ranges become "dense" (min=0, max=0, minW = 1, maxW > 1)
    // if balanceFactor < 0;

    if (this.balanceFactor < 0 && (min != 0 || max != 0)) {
      min = 0;
      max = 0;
      maxW = 1.0 / minW;
      minW = 1;
    }

    return (new DominionSetGeneratorAttributeData(min, max, minW, maxW, notes));
  } else {
    return (new DominionSetGeneratorAttributeData(
      this.tMin[attr],
      this.tMax[attr],
      this.tMinW[attr],
      this.tMaxW[attr],
      this.tNotes[attr]));
  }
};

/**
 * Set the current data for the given attribute.
 *
 * @param {String} attr Which attribute to set.
 * @param {DominionSetGeneratorAttributeData} data The data
 * for the given attribute.
 */
DominionSetGenerator.prototype.setAttributeData = function(attr, data) {
  this.tMin[attr] = data.min;
  this.tMax[attr] = data.max;
  this.tMinW[attr] = data.minW;
  this.tMaxW[attr] = data.maxW;
  this.tNotes[attr] = data.notes;
  this.isDefault[attr] = false;
};

/**
 * Set the given attribute to 'Avoid' -- don't pick these cards
 * if at all possible.
 *
 * @param {String} attr Which attribute to set.
 */
DominionSetGenerator.prototype.attrAvoid = function(attr) {
  this.tMin[attr] = 10 * this.maxSetSize;
  this.tMax[attr] = 10 * this.maxSetSize;
  this.tMinW[attr] = 0.00001;
  this.tMaxW[attr] = 100000;
  this.tNotes[attr] = 'User-modified: Avoid';
  this.isDefault[attr] = false;
};

/**
 * Set the given attribute to 'Fewer' -- try to not pick these
 * cards (by a factor of 10, currently).
 *
 * @param {String} attr Which attribute to set.
 */
DominionSetGenerator.prototype.attrFewer = function(attr) {
  this.tMin[attr] = 10 * this.maxSetSize;
  this.tMax[attr] = 10 * this.maxSetSize;
  this.tMinW[attr] = 0.1;
  this.tMaxW[attr] = 10;
  this.tNotes[attr] = 'User-modified: Fewer';
  this.isDefault[attr] = false;
};

/**
 * Set the given attribute to 'More' -- don't pick these cards
 * if at all possible.
 *
 * @param {String} attr Which attribute to set.
 */
DominionSetGenerator.prototype.attrMore = function(attr) {
  this.tMin[attr] = 10 * this.maxSetSize;
  this.tMax[attr] = 10 * this.maxSetSize;
  this.tMinW[attr] = 10;
  this.tMaxW[attr] = 0.1;
  this.tNotes[attr] = 'User-modified: More';
  this.isDefault[attr] = false;
};

/**
 * Set the given attribute to 'Always' -- try hard to pick these
 * cards (by a factor of 10, currently).
 *
 * @param {String} attr Which attribute to set.
 */
DominionSetGenerator.prototype.attrAlways = function(attr) {
  this.tMin[attr] = 10 * this.maxSetSize;
  this.tMax[attr] = 10 * this.maxSetSize;
  this.tMinW[attr] = 100000;
  this.tMaxW[attr] = 0.00001;
  this.tNotes[attr] = 'User-modified: Always';
  this.isDefault[attr] = false;
};

/**
 * Set the given attribute to 'Range' -- try to pick so that the
 * attribute shows up in a certain range.
 *
 * @param {String} attr Which attribute to set.
 * @param {Number} min Try to add cards to make the set exceed this value.
 * @param {Number} max Try not to add cards that make the set exceed this value.
 * @param {Number} importance The multiplier for this attribute.
 */
DominionSetGenerator.prototype.attrRange = function(attr, min,
                                                    max, importance) {
  this.tMin[attr] = min;
  this.tMax[attr] = max;
  this.tMinW[attr] = importance;
  this.tMaxW[attr] = 1.0 / importance;
  this.tNotes[attr] = 'User-modified: Range';
  this.isDefault[attr] = false;
};

/**
 * Set the given attribute to 'Dense' -- try to pick so that the
 * attribute either doesn't show up or shows up en masse.
 *
 * @param {String} attr Which attribute to set.
 * @param {Number} importance The multiplier for this attribute.
 */
DominionSetGenerator.prototype.attrDense = function(attr, importance) {
  this.tMin[attr] = 0;
  this.tMax[attr] = 0;
  this.tMinW[attr] = 1;
  this.tMaxW[attr] = importance;
  this.tNotes[attr] = 'User-modified: Dense';
  this.isDefault[attr] = false;
};

/**
 * Set the given attribute to 'Sparse' -- try to pick so that the
 * attribute either doesn't show up or shows up en masse.
 *
 * @param {String} attr Which attribute to set.
 * @param {Number} importance The multiplier for this attribute.
 */
DominionSetGenerator.prototype.attrSparse = function(attr, importance) {
  this.tMin[attr] = 0;
  this.tMax[attr] = 0;
  this.tMinW[attr] = 1;
  this.tMaxW[attr] = importance;
  this.tNotes[attr] = 'User-modified: Sparse';
  this.isDefault[attr] = false;
};

/**
 * Reset the current data for the given attribute to
 * the original (internal) value.
 *
 * @param {String} attr Which attribute to set.
 */
DominionSetGenerator.prototype.resetAttribute = function(attr) {
  this.isDefault[attr] = true;
};

/**
 * Reset the current data for all attributes.
 */
DominionSetGenerator.prototype.resetAllAttributes = function() {
  for (attr in this.sgd.cardAttributes) {
    this.resetAttribute(attr);
  }
};

/**
 * Clear the current set.
 *
 */
DominionSetGenerator.prototype.clearSet = function() {
  this.coreKingdom.clearKingdom();
};

/**
 * Canonicalize a card string.
 * Try to find a card in sgd.cardNames that matches the given string.
 * Right now we just lowercase everything and remove alphanumerics and
 * see if things match.
 *
 * @private
 * @param {String} userCard A name to try to match.
 * @return {String} The matching card, or "" if no match.
 */
DominionSetGenerator.prototype.canonName_ = function(userCard) {
  for (var realCard in this.sgd.cardNames) {
    if (userCard.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '') ==
        realCard.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '')) {
      return realCard;
    }
  }
  return '';
};


/**
 * Tells the generator what cards are 'owned'.
 * Cards that are
 * not owned have zero chance of being picked (as opposed to
 * the 'Try to Exclude' setting, which sets the probability of being
 * picked to be very small but not zero).
 * Note that if you own fewer cards than the size of the set, the
 * generator may give unexpected results!
 *
 * @param {Object} data An Object where the keys are the names
 *   of the cards 'owned'.
 * @return {Object} An Object where the keys are the cards that weren't
 *  understodd.
 */
DominionSetGenerator.prototype.setOwned = function(data) {
  var failed = new Object();

  this.owned = new Object();
  for (userCard in data) {
    var realCard = this.canonName_(userCard);
    if (realCard != '') {
      this.owned[realCard] = true;
    } else {
      failed[userCard] = true;
    }
  }

  return failed;
};

/**
 * Put in some cards into the set.
 *
 * @param {Object} cards An Object where the keys are the cards that have to be
 *  put into the set.  A card will be considered a "match" if after being
 *  changed to all lower-case with non-alphanumeric characters removed,
 *  it is the same string in sgd.cardNames.  For example, "Worker's Village"
 *  matches "workersvillage".
 * @return {Object} An Object where the keys are the cards that weren't
 *  understodd.
 */
DominionSetGenerator.prototype.putIntoSet = function(cards) {
  var failed = new Object();

  for (var userCard in cards) {
    var realCard = this.canonName_(userCard);
    if (realCard != '') {
      this.coreKingdom.cardset[realCard] = 1;
    } else {
      failed[userCard] = true;
    }
  }

  return failed;
};


/**
 * Add one card to the given Kingdom.
 *
 * @private
 * @param {DominionKingdom} kingdom The Kingdom to modify.
 * @param {Object} candidates An object where the keys are the
 * permissible cards to use.
 * @return {String} The card that was added.
 */
DominionSetGenerator.prototype.addOneCardToSet_ = function(kingdom,
                                                           candidates) {

  this.updateWeights_(kingdom, candidates,
                      Object.keys(kingdom.cardset).length == 0);

  var card = this.randCard_();
  if (card == 'ERROR') {
    this.log_('Aborting ... ERROR from randCard_');
    throw ('Error in randCard_');
  }
  kingdom.cardset[card] = 1;
  if (Object.keys(kingdom.cardset).length > 0) {
    this.logWeights_(10);
  }
  this.log_('Adding ' + card + ' (' + this.weight[card] + ') to set.');

  return card;

};

/**
 * Recalculate the "decorations" (Shelters, Bane, etc.) for a given kingdom.
 *
 * @private
 * @param {DominionKingdom} kingdom The Kingdom to use.
 * @param {Object} candidates An object where the keys are the
 * permissible cards to use.
 */
DominionSetGenerator.prototype.decorateSet_ = function(kingdom, candidates) {
  kingdom.useShelters =
    (this.sgd.cardData[kingdom.randCard_()]['DarkAges'] == 1);
  kingdom.platinumColony =
    (this.sgd.cardData[kingdom.randCard_()]['Prosperity'] == 1);

  // get the Bane
  this.updateWeights_(kingdom, candidates, false);
  for (var card in this.sgd.cardNames) {
    if (this.sgd.cardData[card]['Cost2'] != 1 &&
        this.sgd.cardData[card]['Cost3'] != 1) {
      this.weight[card] = 0;
    }
  }
  kingdom.youngWitchBane = this.randCard_();

  // get Donline rules
  for (var card in this.sgd.cardNames) {
    if (card in this.owned) {
      this.weight[card] = 1.0;
    } else {
      this.weight[card] = 0.0;
    }
  }
  kingdom.useSheltersDonline =
    (this.sgd.cardData[this.randCard_()]['DarkAges'] == 1);
  kingdom.platinumColonyDonline =
    (this.sgd.cardData[this.randCard_()]['Prosperity'] == 1);
};

/**
 * Fill out the core Kingdom, assuming that the internal set is partially done.
 *
 * @param {Number} maxSetSize Number of cards to put in the set.
 * @return {Object} An Object where all the keys are the cards that are chosen.
 *   (The values will be 1, but we might change this to something more
 *    fancy in the future).
 */
DominionSetGenerator.prototype.completeSet = function(maxSetSize) {
  // generates a set of the given size and returns it.

  this.setMaxSetSize_(maxSetSize);

  var candidates = new Object();
  for (var card in this.owned) {
    candidates[card] = 1;
  }

  for (var card in this.coreKingdom.cardset) {
    if (card in candidates) {
      delete candidates[card];
    }
  }

  while (Object.keys(this.coreKingdom.cardset).length < this.getMaxSetSize()) {
    var newcard = this.addOneCardToSet_(this.coreKingdom, candidates);
    delete candidates[newcard];
  }

  this.decorateSet_(this.coreKingdom, candidates);

  return this.coreKingdom.cardset;
};

/**
 * Generate a new set of cards, using the most current values.
 *
 * @param {Number} maxSetSize Number of cards to put in the set.
 * @return {Object} An Object where all the keys are the cards that are chosen.
 *   (The values will be 1, but we might change this to something more
 *    fancy in the future).
 */
DominionSetGenerator.prototype.generateSet = function(maxSetSize) {
  this.clearSet();
  return this.completeSet(maxSetSize);
};

/**
 * Fill out the core Kingdom, assuming that the internal set is partially done.
 * The way this is done goes like this:
 * put all the candidate cards in a pool and generate lots of sets
 * so that each set has at least maxSetSize cards and
 * every owned card is in one set.  Then choose one
 * of the sets at random and prune it down to maxSetSize.
 * Obviously this algorithm will be slower since it's a meta-algorithm.
 *
 * @param {Number} maxSetSize Number of cards to put in the set.
 * @return {Object} An Object where all the keys are the cards that are chosen.
 *   (The values will be 1, but we might change this to something more
 *    fancy in the future).
 */
DominionSetGenerator.prototype.completeUniformSet = function(maxSetSize) {

  this.setMaxSetSize_(maxSetSize);

  // generate the list of all owned cards.
  var candidates_size = 0;
  var candidates = new Object();
  for (var card in this.owned) {
    if (!(card in this.coreKingdom.cardset)) {
      candidates[card] = 1;
      candidates_size++;
    }
  }

  // figure out how many set we need to generate.
  var gap_count = maxSetSize - Object.keys(this.coreKingdom.cardset).length;
  var set_count = Math.floor(candidates_size / gap_count);

  // create the sets.
  var kingdoms = new Array();
  for (var i=0; i<set_count; ++i) {
    kingdoms.push(new DominionKingdom());  
    for (var card in this.coreKingdom.cardset) {
      kingdoms[i].cardset[card] = 1;
    }
  }

  // load cards into the sets in order.
  var cur_index = 0;
  while (candidates_size > 0) {
    var newcard = this.addOneCardToSet_(kingdoms[cur_index], candidates);
    delete candidates[newcard];
    candidates_size--;
    cur_index++;
    if (cur_index == set_count) cur_index = 0;
  }

  // choose one of the sets at random, biasing each set towards its size
  var set_size_total = 0;
  for (var i=0; i<set_count; ++i) {
    set_size_total += Object.keys(kingdoms[i].cardset).length;
  }

  var randcard = Math.floor(Math.random() * set_size_total);
  var done = false;

  cur_index = 0;
  while (!done) {
    if (randcard < Object.keys(kingdoms[cur_index].cardset).length) {
      done = true;
    } else {
      randcard -= Object.keys(kingdoms[cur_index].cardset).length;
      cur_index++;
    }
  }

  // prune the set down
  // until it has the right number of cards -- but don't remove
  // anything that was already there.
  while (Object.keys(kingdoms[cur_index].cardset).length > maxSetSize) {
    var card = kingdoms[cur_index].randCard_();
    if (!(card in this.coreKingdom.cardset))
      delete kingdoms[cur_index].cardset[kingdoms[cur_index].randCard_()];
  }

  // appoint the new Kingdom.  All hail!
  this.coreKingdom = kingdoms[cur_index];

  // Make a set of candidates for Young Witch.
  candidates = new Object();
  for (var card in this.owned) {
    if (!(card in this.coreKingdom)) {
      candidates[card] = 1;
    }
  }

  this.decorateSet_(this.coreKingdom, candidates);

  return this.coreKingdom.cardset;

};
