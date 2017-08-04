(function (stho) {
    let activityLevelSelectList =  [
        { value: stho.ActivityLevel.SEDENTARY, text: stho.ActivityLevel[stho.ActivityLevel.SEDENTARY] },
        { value: stho.ActivityLevel.LIGHTLY, text: stho.ActivityLevel[stho.ActivityLevel.LIGHTLY] },
        { value: stho.ActivityLevel.MODERATELY, text: stho.ActivityLevel[stho.ActivityLevel.MODERATELY] },
        { value: stho.ActivityLevel.VERY, text: stho.ActivityLevel[stho.ActivityLevel.VERY] },
        { value: stho.ActivityLevel.EXTRA, text: stho.ActivityLevel[stho.ActivityLevel.EXTRA] }
    ]; 
    
    let macroPresets = [
        { text: 'Normal',    fat: 20, carbs: 50, protein: 30 },
        { text: 'Low carb - High fat',  fat: 75, carbs: 5, protein: 20  }
    ];
    
    let calculationOptions = [
        { text: 'days', value: "1" },
        { text: 'week', value: "2" }
    ];
    
    let ViewModel = function () {
        this.gender             = ko.observable("1");
        this.gender.subscribe(() => this.calculate(this));
        
        this.weight             = ko.observable(80);
        this.height             = ko.observable(170);
        this.goalWeight         = ko.observable(70);
        this.weeklyWeightLoss   = ko.observable(0.5);
        this.age                = ko.observable(28); 
        this.activityLevel      = ko.observable(stho.ActivityLevel.VERY);
        this.activityLevel.subscribe(() => this.calculate(this));
        this.activityLevels     = activityLevelSelectList;
        this.days               = ko.observable([]);
        
        this.macroPresets         = macroPresets;
        this.selectedMacroPreset  = ko.observable(null);
        this.selectedMacroPreset.subscribe((macro) => {
            if (macro != null) {
                this.fat(macro.fat);
                this.carbs(macro.carbs);
                this.protein(macro.protein);    
                this.calculate(this);
                this.selectedMacroPreset(null);
            }
        });
        
        this.carbs   = ko.observable(50);
        this.fat     = ko.observable(20);
        this.protein = ko.observable(30);
        
        this.calculationOptions         = calculationOptions;
        this.selectedcalculationOptions = ko.observable("1");
        this.periodHeading = ko.computed(() => {
            if (this.selectedcalculationOptions() === "1") {
                return 'Day';
            } else {
                return 'Week';
            }
        });
        
        this.selectedcalculationOptions.subscribe((value) => {
            console.log(arguments);
            if (value != null) {
                this.calculate(this);
            } 
        });
    };

    ViewModel.prototype = {
        constructor: ViewModel,

        calculate: (viewModel) => {
            let results = [];
            
            try {
                let rows = [];
                let parameters = new stho.CalculateParameters();
                
                parameters.gender   = parseInt(viewModel.gender());
                parameters.weight   = parseFloat(viewModel.weight());
                parameters.height   = parseFloat(viewModel.height());
                parameters.age      = parseFloat(viewModel.age());
                parameters.goalWeight = parseFloat(viewModel.goalWeight());
                parameters.goalWeightDiffrencePrWeek = -Math.abs(parseFloat(viewModel.weeklyWeightLoss()));
                parameters.activityLevel = parseInt(viewModel.activityLevel());
                
                parameters.macros = {
                    fat: parseInt(viewModel.fat()),
                    carbs: parseInt(viewModel.carbs()),
                    protein: parseInt(viewModel.protein()),
                };
                
                if (viewModel.selectedcalculationOptions() === "1") {
                    results = stho.Calculator.calculate(parameters);    
                } else {
                    results = stho.Calculator.calculateWeeks(parameters);
                }
                
            } catch (e) {
                console.log(e);
                return [];
            }

            viewModel.days(results);
        }
    };

    stho.ViewModel = ViewModel;
})(window.stho = (window.stho || {}));