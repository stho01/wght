(function (stho) {
    stho.Gender  = {
        1        : "MALE",
        2        : "FEMALE",
        "MALE"   : 1,
        "FEMALE" : 2
    };
    
    stho.ActivityLevel = {
        /**
         * Little or no exercise. 
         */
        SEDENTARY: 1,

        /**
         * exercise/sports (1–3 times/week)
         */
        LIGHTLY: 2,

        /**
         * exercise/sports (3–5 times/week)
         */
        MODERATELY: 3,

        /**
         * exercise/sports (6–7 times/week)
         */
        VERY: 4,

        /**
         * exercise/sports (6–7 times/week)
         */
        EXTRA: 5,
        
        1: "SEDENTARY",
        2: "LIGHTLY",
        3: "MODERATELY",
        4: "VERY",
        5: "EXTRA"
    }
})(window.stho = (window.stho || {}));
