(function() {
  var viz = {
    id: "highcharts_arearange",
    label: "Arearange",
    options: {
      chartName: {
        section: "Chart",
        label: "Chart Name",
        type: "string",
      },
      color_range: {
        type: "array",
        label: "Color Range",
        display: "colors",
        default: ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"],
      },
      xAxisName: {
        label: "Axis Name",
        section: "X",
        type: "string",
        placeholder: "Provide an axis name ..."
      },
      yAxisName: {
        label: "Axis Name",
        section: "Y",
        type: "string",
        placeholder: "Provide an axis name ..."
      },
      yAxisMinValue: {
        label: "Min value",
        default: null,
        section: "Y",
        type: "number",
        placeholder: "Any number",
        display_size: "half",
      },
      yAxisMaxValue: {
        label: "Max value",
        default: null,
        section: "Y",
        type: "number",
        placeholder: "Any number",
        display_size: "half",
      },
    },

    handleErrors: function(data, resp) {
      var min_mes, max_mes, min_dim, max_dim, min_piv, max_piv;
      min_mes = 2
      max_mes = 2
      min_dim = 1
      max_dim = 1
      min_piv = 0
      max_piv = 0

      if (resp.fields.pivots.length > max_piv) {
        this.addError({
          group: "pivot-req",
          title: "Incompatible Data",
          message: "No pivot is allowed"
        });
        return false;
      } else {
        this.clearErrors("pivot-req");
      }

      if (resp.fields.pivots.length < min_piv) {
        this.addError({
          group: "pivot-req",
          title: "Incompatible Data",
          message: "Add a Pivot"
        });
        return false;
      } else {
        this.clearErrors("pivot-req");
      }

      if (resp.fields.dimension_like.length > max_dim) {
        this.addError({
          group: "dim-req",
          title: "Incompatible Data",
          message: "You need " + min_dim +" to "+ max_dim +" dimensions"
        });
        return false;
      } else {
        this.clearErrors("dim-req");
      }

      if (resp.fields.dimension_like.length < min_dim) {
        this.addError({
          group: "dim-req",
          title: "Incompatible Data",
          message: "You need " + min_dim +" to "+ max_dim +" dimensions"
        });
        return false;
      } else {
        this.clearErrors("dim-req");
      }

      if (resp.fields.measure_like.length > max_mes) {
        this.addError({
          group: "mes-req",
          title: "Incompatible Data",
          message: "You need " + min_mes +" to "+ max_mes +" measures"
        });
        return false;
      } else {
        this.clearErrors("mes-req");
      }

      if (resp.fields.measure_like.length < min_mes) {
        this.addError({
          group: "mes-req",
          title: "Incompatible Data",
          message: "You need " + min_mes +" to "+ max_mes +" measures"
        });
        return false;
      } else {
        this.clearErrors("mes-req");
      }

      // If no errors found, then return true
      return true;
    },

   create: function(element, config) {
    var d3 = d3v4;

        var css = element.innerHTML = `
      <style>
      .axis {
      font-family: Futura;
      font-size: 10px;
      },  
      .tooltip {
        transition: 0.5s opacity;
      }
      </style>
    `;


    this._svg = d3.select(element).append("svg");

  },

    // Render in response to the data or settings changing
    update: function(data, element, config, queryResponse) {
      if (!this.handleErrors(data, queryResponse)) return;
      var d3 = d3v4;

      let dim = queryResponse.fields.dimension_like[0]
      let measures = queryResponse.fields.measure_like

      let categories = []
      let series = []
      data.forEach(function(datum) {
        let point = []

        if (dim.is_timeframe) {
          let date = datum[dim.name]["value"]
          switch(dim.field_group_variant) {
            case "Month":
            case "Quarter":
              date = date + "-01"
              break;
            case "Year":
              date = date + "-01-01"
              break;
          }
          dateVal = Date.UTC.apply(Date, date.split(/\D/))
          point.push(dateVal)
        } else if (dim.is_numeric) {
          point.push(datum[dim.name]["value"])
        } else {
          categories.push(datum[dim.name]["rendered"] ?
          datum[dim.name]["rendered"] :
          datum[dim.name]["value"])
        }

        measures.forEach(function(m) {
          point.push(datum[m.name]["value"])
        })

        series.push(point)
      })

      function unique(value, index, self) {
        return self.indexOf(value) === index;
      }

      let field_group_labels = measures.map(function(m) { return m.field_group_label})
      let field_group_label = field_group_labels.filter(unique)[0] // first. yolo

      let xAxisLabel = config.xAxisName ?
        config.xAxisName :
        dim.label_short ?
          dim.label_short :
          dim.label

      let yAxisLabel = config.yAxisName ?
        config.yAxisName :
        field_group_label ?
          field_group_label :
          measures[0].label_short ?
            measures[0].label_short :
            measures[0].label


      let options = {
          colors: config.color_range,
          credits: {
            enabled: false
          },
          chart: {
            type: "arearange",
            zoomType: "x"
          },
          title: {text: config.chartName},
          legend: {enabled: false},

          xAxis: {
            type: dim.is_timeframe ? "datetime" : null,
            title: {
              text: xAxisLabel
            }
          },

          yAxis: {
            min: config.yAxisMinValue,
            max: config.yAxisMaxValue,
            title: {
              text: 'Range',
            }
          },

          tooltip: {
            crosshairs: true,
            shared: true,
          },

          plotOptions: {
              area: {
                  fillColor: {
                      linearGradient: {
                          x1: 0,
                          y1: 0,
                          x2: 0,
                          y2: 1
                        },
                      stops: [
                          [0, Highcharts.getOptions().colors[0]],
                          [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                  marker: {
                      radius: 2
                    },
                  lineWidth: 1,
                  states: {
                      hover: {
                          lineWidth: 1
                      }
                    },
                  threshold: null
                }
            },

          series: [{
            name: 'Range',
            data: series,
            color: Highcharts.getOptions().colors[0],
            fillOpacity: 0.3,
            zIndex: 0,
            marker: {
            enabled: true
        }
          }],
      };
      if (categories.length > 0) {
        options["xAxis"]["categories"] = categories
      }

      let myChart = Highcharts.chart(element, options);
    }
  };
  looker.plugins.visualizations.add(viz);
}());