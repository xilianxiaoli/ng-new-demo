/**
 * @name ionClock
 * @module ionicClock
 * @restrict E
 * @usage
 * @param radius default with 100px
 * ```html
 * <ion-clock radius="20">
 *
 * </ion-clock>
 * ```
 */
define([_serverURL + 'modules/common/_module.js'], function (module) {

module.directive('ionClock', [function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/common/directives/clockDirective/template.html',
        scope: {
            radius: '@'
        },
        link: function (scope, element, attr, controller) {
            element.addClass('clock-content');
            var secondHandle = element.find(".second")[0],
                minuteHandle = element.find(".minute")[0],
                hourHandle = element.find(".hour")[0],
                minilines = element.find(".minilines")[0],
                microlines = element.find(".microlines")[0];

            var proportion = scope.radius ? scope.radius / 100 : 1;

            function setClock() {
                var date = new Date(/*"December 25, 1995 00:15:00"*/),
                    dateHours = date.getHours(),
                    hour = dateHours < 12 ? dateHours : dateHours - 12,
                    minute = date.getMinutes(),
                    secondAngle = date.getSeconds() * (360 / 60),
                    minuteAngle = (minute * (360 / 60)) + (secondAngle / 60),
                    hourAngle = (hour * (360 / 12)) + (minuteAngle / 12);
                // Change clock handles
                secondHandle.setAttribute("transform", "rotate(" + secondAngle + " " + (proportion * 100) + "," + (proportion * 100) + ")");
                minuteHandle.setAttribute("transform", "rotate(" + minuteAngle + " " + (proportion * 100) + "," + (proportion * 100) + ")");
                hourHandle.setAttribute("transform", "rotate(" + hourAngle + " " + (proportion * 100) + "," + (proportion * 100) + ")");

                setTimeout(setClock, 1000);
            }

            // Append mini lines
            for (var i = 0; i < 12; i++) {
                var el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                el.setAttribute('x1', (proportion * 100));
                el.setAttribute('y1', (proportion * 15));
                el.setAttribute('x2', (proportion * 100));
                el.setAttribute('y2', (proportion * 30));
                el.setAttribute('transform', 'rotate(' + (i * 360 / 12) + ' ' + (proportion * 100) + ' ' + (proportion * 100) + ')');
                minilines.appendChild(el);
            }

            // Append micro lines
            for (var i = 0; i < 60; i++) {
                var el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                el.setAttribute('x1', (proportion * 100));
                el.setAttribute('y1', (proportion * 15));
                el.setAttribute('x2', (proportion * 100));
                el.setAttribute('y2', (proportion * 20));
                el.setAttribute('transform', 'rotate(' + (i * 360 / 60) + ' ' + (proportion * 100) + ' ' + (proportion * 100) + ')');
                microlines.appendChild(el);
            }
            // Run the clock
            setClock();

            var dial = element.find(".dial")[0];
            dial.cx.baseVal.value = 100 * proportion;
            dial.cy.baseVal.value = 100 * proportion;
            dial.r.baseVal.value = 96 * proportion;

            var shadow = element.find(".shadow")[0];
            shadow.cx.baseVal.value = 100 * proportion;
            shadow.cy.baseVal.value = 100 * proportion;
            shadow.r.baseVal.value = 100 * proportion;


            hourHandle.setAttribute('x1', (proportion * 100));
            hourHandle.setAttribute('y1', (proportion * 100));
            hourHandle.setAttribute('x2', (proportion * 100));
            hourHandle.setAttribute('y2', (proportion * 50));

            secondHandle.setAttribute('x1', (proportion * 100));
            secondHandle.setAttribute('y1', (proportion * 115));
            secondHandle.setAttribute('x2', (proportion * 100));
            secondHandle.setAttribute('y2', (proportion * 15));

            minuteHandle.setAttribute('x1', (proportion * 100));
            minuteHandle.setAttribute('y1', (proportion * 100));
            minuteHandle.setAttribute('x2', (proportion * 100));
            minuteHandle.setAttribute('y2', (proportion * 32));


            var c1 = element.find(".center1")[0];
            c1.cx.baseVal.value *= proportion;
            c1.cy.baseVal.value *= proportion;
            c1.r.baseVal.value *= proportion;

            var c2 = element.find(".center2")[0];
            c2.cx.baseVal.value *= proportion;
            c2.cy.baseVal.value *= proportion;
            c2.r.baseVal.value *= proportion;

            var svg = angular.element(element.find("svg")[0]);
            svg.width(200 * proportion).height(200 * proportion);
        }
    }
}]);
});