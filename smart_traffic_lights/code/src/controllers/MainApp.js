const Vue = require("vue/dist/vue");
require("./TrafficLights");
const cocoSsd = require("@tensorflow-models/coco-ssd");
const Dialog = require("../components/Dialog");

new Vue({
    el: "#vueapp",
    data: {
        countSN: 0,
        countEW: 0,
        recentCountSN: [],
        recentCountEW: [],
        recentCountSNNumber: 0,
        recentCountEWNumber: 0
    },
    async mounted() {
        let d = Dialog.showLoading("正在加载模型");
        this._model = await cocoSsd.load({
            modelUrl: "models/ssdlite_mobilenet_v2/model.json"
        });

        d.modal("hide");

        this.startDetectionTask();
    },

    methods: {
        startDetectionTask() {
            setInterval(async () => {
                let detectionsSN = await this._model.detect(this.$refs.previewSN);
                let detectionsEW = await this._model.detect(this.$refs.previewEW);

                this.countSN = detectionsSN.length;
                this.countEW = detectionsEW.length;

                this.recentCountSN.push(this.countSN);
                if (this.recentCountSN.length > 20) {
                    this.recentCountSN.shift();
                }
                this.recentCountEW.push(this.countEW);
                if (this.recentCountEW.length > 20) {
                    this.recentCountEW.shift();
                }

                this.recentCountSNNumber = this.recentCountSN.reduce((a, b) => a + b);
                this.recentCountEWNumber = this.recentCountEW.reduce((a, b) => a + b);

                if (this.recentCountEWNumber > this.recentCountSNNumber) {
                    this.$refs.tl.ewClearanceDuration = 15;
                    this.$refs.tl.snClearanceDuration = 10;
                } else if (this.recentCountEWNumber < this.recentCountSNNumber) {
                    this.$refs.tl.ewClearanceDuration = 10;
                    this.$refs.tl.snClearanceDuration = 15;
                } else {
                    this.$refs.tl.ewClearanceDuration = 10;
                    this.$refs.tl.snClearanceDuration = 10;
                }
            }, 300);
        }
    }
});