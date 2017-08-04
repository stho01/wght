(function (stho) {
    stho.CalculateParameters = function () {
        this.gender = stho.Gender.MALE;
        this.weight = 76;
        this.height = 170;
        this.age    = 28;
        this.activityLevel = stho.ActivityLevel.VERY;
        
        this.goalWeight = 70;
        this.goalWeightDiffrencePrWeek = -1;
        
        this.macros = {
            fat: 20,
            carbs: 50,
            protein: 30
        }
    };

    stho.BMRFormulas = {
        originalHarrisBendedrictEquation: (gender, weight, height, age) => {
            if (gender === stho.Gender.MALE) {
                return 66.4730 + (13.7516*weight) + (5.0033*height) - (6.7550*age);    
            } else {
                return 655.0955 + (9.5634*weight) + (1.8496*height) - (4.6756*age);
            }
        },
        revisedHarrisBendedrictEquation: (gender, weight, height, age) => {
            if (gender === stho.Gender.MALE) {
                return 88.362 + (13.397*weight) + (4.799*height) - (5.677*age);
            } else {
                return 447.593 + (9.247*weight) + (3.098*height) - (4.330*age);
            }
        },
        mifflinStJeorEquation: (gender, weight, height, age) => {
            let genderValue = (gender === stho.Gender.MALE) ? 5 : -161;
            return (10*weight) + (6.25*height) - (5*age) + genderValue;
        }
    };
    
    stho.Calculator = {
        CALORIES_ONE_KG_FAT     : 7700,
        CALORIES_ONE_G_FAT      : 9,
        CALORIES_ONE_G_CARB     : 4,
        CALORIES_ONE_G_PROTEIN  : 4,
        
        formula: stho.BMRFormulas.revisedHarrisBendedrictEquation,

        calculateWeeks: (calculatorParameters) => {
            let currentWeight   = calculatorParameters.weight,
                goalWeight      = calculatorParameters.goalWeight,
                results         = [],
                predicate       =  currentWeight > goalWeight ? () => currentWeight >= goalWeight : () => currentWeight <= goalWeight;

            while (currentWeight >= 0 && predicate()) {
                results.push(stho.Calculator._getResult(
                    calculatorParameters, 
                    stho.Calculator.calculateWeeklyEnergyNeed(
                        calculatorParameters.gender,
                        currentWeight,
                        calculatorParameters.height,
                        calculatorParameters.age,
                        calculatorParameters.activityLevel,
                        calculatorParameters.goalWeightDiffrencePrWeek), 
                    currentWeight, 
                    true));
             
                if (calculatorParameters.goalWeightDiffrencePrWeek === 0) { 
                    break; 
                }
                currentWeight += (calculatorParameters.goalWeightDiffrencePrWeek);
            }

            return results;
        },
        
        calculate: (calculatorParameters) => {
            let currentWeight = calculatorParameters.weight,
                goalWeight  = calculatorParameters.goalWeight,
                results = [];
   
            let predicate =  currentWeight > goalWeight 
                                ? () => currentWeight >= goalWeight 
                                : () => currentWeight <= goalWeight;
            
            while (currentWeight >= 0 && predicate()) {
                results.push(stho.Calculator._getResult(
                    calculatorParameters,
                    stho.Calculator.calculateDailyEnergyNeed(
                        calculatorParameters.gender,
                        currentWeight,
                        calculatorParameters.height,
                        calculatorParameters.age,
                        calculatorParameters.activityLevel,
                        calculatorParameters.goalWeightDiffrencePrWeek),
                    currentWeight));
                
                if (calculatorParameters.goalWeightDiffrencePrWeek === 0) { break; }
                currentWeight += (calculatorParameters.goalWeightDiffrencePrWeek / 7);
            }
            
            return results;
        },
        
        calculateWeeklyEnergyNeed: (gender, weight, height, age, activityLevel, wwLoss) => {
            let calorieNeed = 0,
                currentWeight = weight;
            
            // aggregate 7 days 
            for (let i = 0; i < 7; i++) {
                calorieNeed += stho.Calculator.calculateDailyEnergyNeed(gender, currentWeight, height, age, activityLevel);
                currentWeight -= wwLoss;
            }
            
            return calorieNeed;
        },
        
        calculateDailyEnergyNeed: (gender, weight, height, age, activityLevel) => {
            let calories = stho.Calculator.formula(gender, weight, height, age);
            return stho.Calculator.applyHarrisBenedictActivityPrinciple(calories, activityLevel);
        },
        
        _getResult: (calculatorParameters,caloriesNeededForMaintenance, currentWeight, week) => {
            let w = week || false;
            let calDeficitOrAbundance = (stho.Calculator.CALORIES_ONE_KG_FAT * calculatorParameters.goalWeightDiffrencePrWeek) / (w ? 1 : 7);
            let calories              = caloriesNeededForMaintenance + calDeficitOrAbundance;
            let macroDistribution     = stho.Calculator.getMacroDistribution(calculatorParameters.macros, calories);

            return {
                weight                      : currentWeight.toFixed(1),
                calDeficitOrAbundance       : calDeficitOrAbundance.toFixed(0),
                calMaintenance              : caloriesNeededForMaintenance.toFixed(0),
                calForWeightDifference      : Math.max(calories, 0).toFixed(0),
                fat                         : macroDistribution.fat.toFixed(0) + "g",
                carbs                       : macroDistribution.carbs.toFixed(0) + "g",
                protein                     : macroDistribution.protein.toFixed(0) + "g"
            };
        },

        /**
         * 
         * @param macroSettings
         * @param totalCalories
         */
        getMacroDistribution: (macroSettings, totalCalories) => {
            
            return {
                fat     : totalCalories <= 0 ? 0 : totalCalories * (macroSettings.fat/100)       / stho.Calculator.CALORIES_ONE_G_FAT,
                carbs   : totalCalories <= 0 ? 0 : totalCalories * (macroSettings.carbs/100)     / stho.Calculator.CALORIES_ONE_G_CARB,
                protein : totalCalories <= 0 ? 0 : totalCalories * (macroSettings.protein/100)   / stho.Calculator.CALORIES_ONE_G_PROTEIN
            };
        },

        /**
         * 
         * @param calories
         * @param activityLevel
         * @return {*}
         */
        applyHarrisBenedictActivityPrinciple: (calories, activityLevel) => {
            switch (activityLevel) {
                case stho.ActivityLevel.SEDENTARY   : return calories * 1.2;
                case stho.ActivityLevel.LIGHTLY     : return calories * 1.375;
                case stho.ActivityLevel.MODERATELY  : return calories * 1.55;
                case stho.ActivityLevel.VERY        : return calories * 1.725;
                case stho.ActivityLevel.EXTRA       : return calories * 1.9;
                default: return calories; 
            }
        }
    };
})(window.stho = (window.stho || {}));
