looker.plugins.visualizations.add({
    id: "highcharts_bar_test",
    label: "bar_test",
    options: {
      color_range: {
      type: "array",
      label: "Color Range",
      display: "colors",
      default: ["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"],
    },
      chartName: {
        section: "Chart",
        label: "Chart Name",
        type: "string",
      },
    },
    // require proper data input
    handleErrors: function(data, resp) {
      var min_mes, max_mes, min_dim, max_dim, min_piv, max_piv;
      min_mes = 1
      max_mes = 5
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
      font-size: 9px;
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

      var color = d3.scaleOrdinal()
      .range(config.color_range);

      function formatType(valueFormat) {
        if (typeof valueFormat != "string") {
          return function (x) {return x}
        }
        let format = ""
        switch (valueFormat.charAt(0)) {
          case '$':
            format += '$'; break
          case '£':
            format += '£'; break
          case '€':
            format += '€'; break
        }
        if (valueFormat.indexOf(',') > -1) {
          format += ','
        }
        splitValueFormat = valueFormat.split(".")
        format += '.'
        format += splitValueFormat.length > 1 ? splitValueFormat[1].length : 0

        switch(valueFormat.slice(-1)) {
          case '%':
            format += '%'; break
          case '0':
            format += 'f'; break
        }
        return d3.format(format)
      }

      let x = queryResponse.fields.dimension_like[0]
      let measures = queryResponse.fields.measure_like
      let xCategories = data.map(function(row) {return row[x.name].value})

      let series = measures.map(function(m) {
        let format = formatType(m.value_format)
        return {
          name: m.label_short ? m.label_short : m.label,
          pointPlacement: 'on',
          data: data.map(function(row) {
            return row[m.name].value
          }),
          tooltip: {
            pointFormatter: function() {
              return `<span style="color:${this.series.color}">${this.series.name}: <b>${format(this.y)}</b><br/>`
            }
          },
        }
      })

      let options = {
        credits: {
          enabled: false
        },
        chart: {
          polar: false,
          type: 'column'
        },

      legend: {
        align: 'left',
        verticalAlign: 'top',
        y: 70,
        layout: 'vertical'
    },
        title: {text: config.chartName},
        style: {
            fontFamily: 'Futura'
        },
    color_range: {
      type: "array",
      label: "Color Range",
      display: "colors",
      default: ["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"],
    },
        xAxis: {
          categories: xCategories,
        },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0
        }
    },
        series: series,
      }
      
      let myChart = Highcharts.chart(element, options);
          console.log(options)
    }


  });