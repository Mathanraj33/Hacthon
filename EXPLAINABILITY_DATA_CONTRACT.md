\# Explainability Data Contract



\## Purpose



This contract defines the API shape required by the frontend waterfall chart

to explain how individual indicators affect the overall sustainability score.



\## API Response



```json

{

&#x20; "ward\_id": 1,

&#x20; "ward\_name": "Example Area",

&#x20; "score": 72,

&#x20; "indicator\_contributions": \[

&#x20;   {

&#x20;     "indicator": "PM2.5",

&#x20;     "value": 28.4,

&#x20;     "unit": "µg/m³",

&#x20;     "contribution": -8.5,

&#x20;     "direction": "negative",

&#x20;     "weight": 0.25,

&#x20;     "source": "open-meteo"

&#x20;   },

&#x20;   {

&#x20;     "indicator": "PM10",

&#x20;     "value": 54.2,

&#x20;     "unit": "µg/m³",

&#x20;     "contribution": -4.2,

&#x20;     "direction": "negative",

&#x20;     "weight": 0.20,

&#x20;     "source": "open-meteo"

&#x20;   }

&#x20; ]

}

