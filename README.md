# insightfulUBC

insightfulUBC is a full stack web application that parses UBC metadata and allows users to query information on the university or build an optimized schedule. The web application was made with a partner for our final term project for [CPSC 310 : Introduction to Software Engineering](https://github.com/ubccpsc/310/tree/2017jan).


## Local Development


1. ```yarn run clean```

1. ```yarn run configure```

1. ```yarn run build```


### Executing the unit test suite
 
* Test: ```yarn run test``` (or ```yarn test```)
* Test coverage: ```yarn run cover``` (or ```yarn run coverwin``` if you use Windows). HTML reports can be found: ```./coverage/lcov-report/index.html```

### Starting the server

* ```yarn run start```

### Running and testing from an IDE

To run or test the system in WebStorm you will need to configure run targets: 

* **To run the system**: Go to the ```Run->Edit Configurations``` and tap on the ```+``` and then ```Node.js```. Point the 'JavaScript file' argument to ```src/App.js```. 

* **To run unit tests**: Go to the ```Run->Edit Configurations``` and tap on the ```+``` and then ```Mocha```. Point the 'Test Directory' file argument to ```test/```. You can also optionally tap the ```+``` in the ```Before launch``` box and select ```Compile TypeScript``` if you want to make sure a fresh TypeScript compile is forced before each test run.


