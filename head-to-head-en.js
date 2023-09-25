///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 01. Setup //////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Dimensions
let dimensions_head_en = {
    width: window.innerWidth * 0.95,
    height: window.innerHeight * 0.9,
    margin: {
        top: 70,
        right: 140,
        bottom: 70,
        left: 140,
    },
};

//Define drawing area within "dimensions" object
dimensions_head_en.vizboardWidth = dimensions_head_en.width - dimensions_head_en.margin.left - dimensions_head_en.margin.right;

dimensions_head_en.vizboardHeight = dimensions_head_en.height - dimensions_head_en.margin.top - dimensions_head_en.margin.bottom;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Draw SVG
const vizboardWidth_head_en = 800;
const vizboardHeight_head_en = 1200;

const vizboard_head_en = d3
    .select("#vizboard-head-en")
    .append("svg")
    .classed("svg-vizboard", true)
    .attr("viewBox", `0 0 ${vizboardWidth_head_en} ${vizboardHeight_head_en}`);
// .attr("preserveAspectRatio", "xMinYMin meet");
// .style("border", "1px dashed light#320071")

let svg_head_en = vizboard_head_en
    .append("g")
    .style("transform", `translate(${dimensions_head_en.margin.left}px, ${dimensions_head_en.margin.top}px)`);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create SVG dimensions
let width_head_en = vizboardWidth_head_en - dimensions_head_en.margin.left - dimensions_head_en.margin.right;
let height_head_en = vizboardHeight_head_en - dimensions_head_en.margin.top - dimensions_head_en.margin.bottom;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 02. Data ///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const matches_long_file = "data/odi_long.csv";
const matches_stats_file = "data/odi_stats.csv";

// dataset
var worldcup_matches_long = [];
var worldcup_matches_stats = [];
var worldcup_countries = [];

// data converter function
var matches_long_converter = function (point) {
    return {
        serial: +point.serial,
        year: +point.year,
        month: +point.month,
        day: +point.day,
        decade: +point.decade,
        year_n: +point.year_n,
        size: +point.size,
        result: point.result,
        ground: point.ground,

        team: point.team,
        team_txt: point.team_txt,

        team_a: point.team_a,
        team_b: point.team_b,
        team_a_txt: point.team_a_txt,
        team_b_txt: point.team_b_txt,
        team_a_result: point.team_a_result,
        team_b_result: point.team_b_result,
        random: +point.random,
    };
};

// data converter function
var matches_stats_converter = function (point) {
    return {
        team_a: point.team_a,
        team_a_txt: point.team_a_txt,
        team_b: point.team_b,
        team_b_txt: point.team_b_txt,
        matches: +point.total,
        winning_perc: +point.winning_perc,
        losing_perc: +point.losing_perc,

        winner: +point.winner,
        loser: +point.loser,
        draw: +point.draw,
    };
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Promise.all([d3.csv(matches_long_file, matches_long_converter), d3.csv(matches_stats_file, matches_stats_converter)]).then(function ([
    matches_long,
    matches_stats,
]) {
    // save data in dataset variable
    worldcup_matches_long = matches_long;
    worldcup_matches_stats = matches_stats;

    // console.log(worldcup_matches_long[0]);
    // console.log(worldcup_matches_stats[0]);
    // call the draw function
    dataviz_head_en();
}); //end of then method

function dataviz_head_en() {
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 03. Nested Data ////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Teams Data
    worldcup_countries = d3.flatRollup(
        worldcup_matches_long,
        (v) => v.length,
        (d) => d.team,
        (s) => s.team_txt
    );

    worldcup_matches_long = worldcup_matches_long.slice().sort((a, b) => d3.ascending(a.team, b.team));
    worldcup_countries = worldcup_countries.slice().sort((a, b) => d3.ascending(a[0], b[0]));

    // console.log(worldcup_countries);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 04. Scales /////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // A scale that gives a X target position for each group
    const group_scale = d3
        .scalePoint()
        .domain([0, 1])
        .range([-width_head_en / 2.5, width_head_en / 2.5]);

    // Sub Circles Scale
    const subGroups_scale = d3.scaleLinear().domain([1, 7]).range([40, 180]);

    // Angle Match Slice
    const angleMatchSlice = (Math.PI * 2) / 10;

    // Match Color Scale
    const match_color_scale = d3
        .scaleOrdinal()
        .domain(["Winner", "Loser", "No result", "Tied"])
        .range(["#320071", "#FF009B", "grey", "grey"]);

    // Match Result Scale
    const match_result_scale = d3.scaleSqrt().domain([0, 1]).range([2, 5]);

    // Match Result Scale
    const match_line_scale = d3.scaleLinear().domain([0, 1]).range([0, 1.2]);

    // Opacity Scale
    const result_opacity_scale = d3.scaleLinear().domain([0, 1]).range([0, 0.4]);

    // Match Color Scale
    const month_scale = d3
        .scaleOrdinal()
        .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
        .range(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]);

    // Match Color Scale
    const color_scale = d3
        .scaleOrdinal()
        .domain([
            "Afghanistan",
            "Australia",
            "Bangladesh",
            "England",
            "India",
            "Netherlands",
            "New_Zealand",
            "Pakistan",
            "South_Africa",
            "Sri_Lanka",
        ])
        .range(["#336699", "#FFC200", "#0A490A", "#6699CC", "#0066CC", "#FF009B", "#000000", "#339933", "#206006", "#003366"]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 05. Shapes Creation ////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Create Group
    const mainGroup = svg_head_en
        .append("g")
        .classed("main-group", true)
        .attr("transform", `translate(${width_head_en * 0.5}, ${(height_head_en + 200) * 0.5})`);

    const p_position = function (i) {
        let x = group_scale(i);
        let y = 0;
        return [x, y];
    };

    // Group A and B
    const subGroups = mainGroup
        .selectAll("g.sub-groups")
        .data([0, 1])
        .join("g")
        .classed("sub-groups", true)
        .attr("transform", (d, i) => `translate(${p_position(i)})`);

    // Reference Circles
    const refCircles = subGroups.each(function (d, i) {
        d3.select(this)
            .selectAll("circle.ref-circles")
            .data(d3.range(1, 7, 1))
            .join("circle")
            .classed("ref-circles", true)
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", (d, i) => subGroups_scale(d))
            .style("fill", "#dbdbdb")
            .style("fill-opacity", 0)
            .style("stroke", "grey")
            .style("stroke-dasharray", "6,3")
            .style("stroke-width", 2)
            .style("stroke-opacity", 0.5);
    });

    const back_circle = mainGroup.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 800).style("opacity", 0).style("fill", "#dbdbdb");

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 06. Matches Circles ////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    let varation = 1;
    // // console.log(worldcup_matches_long_groups);
    // ///////////////////////////////////////////////////////////////////////////
    // // Position Functions
    const match_Xposition = function (d) {
        let x_delta = (d.random - 0.5) / varation;
        let y_delta = (d.random - 0.5) / varation;
        let x = (subGroups_scale(d.decade) + y_delta) * Math.cos(angleMatchSlice * d.year_n + x_delta - Math.PI / 2);
        return x;
    };

    const match_Yposition = function (d) {
        let x_delta = (d.random - 0.5) / varation;
        let y_delta = (d.random - 0.5) / varation;
        let y = (subGroups_scale(d.decade) + y_delta) * Math.sin(angleMatchSlice * d.year_n + x_delta - Math.PI / 2);
        return y;
    };

    // //////////////////////////////////////////////////////////////////////////////

    // Match Circles
    let matchCircles1 = mainGroup.each(function (d, i) {
        d3.select(this)
            .selectAll("circle.match-circles-head-1")
            .data(worldcup_matches_long)
            .join("circle")
            .attr("class", (d) => `match-circles-head match-circles-head-1 serial_${d.serial} a_team_c_${d.team_a} b_team_c_${d.team_b}`)
            .attr("cx", (d, i) => match_Xposition(d, i) + group_scale(0))
            .attr("cy", (d, i) => match_Yposition(d, i))
            .attr("r", (d, i) => match_result_scale(d.size))
            .style("fill", (d, i) => match_color_scale(d.team_a_result))
            .style("stroke", (d, i) => match_color_scale(d.team_a_result))
            // .style("fill", (d, i) => (d.team_a_result == "Winner" ? color_scale(d.team_a) : color_scale(d.team_b)))
            // .style("stroke", (d, i) => (d.team_a_result == "Winner" ? color_scale(d.team_a) : color_scale(d.team_b)))
            .style("stroke-width", 1)
            .style("fill-opacity", 0.4)
            .style("stroke-opacity", 0.7);
    });

    let matchCircles2 = mainGroup.each(function (d, i) {
        d3.select(this)
            .selectAll("circle.match-circles-head-2")
            .data(worldcup_matches_long)
            .join("circle")
            .attr("class", (d) => `match-circles-head match-circles-head-2 serial_${d.serial} a_team_c_${d.team_a} b_team_c_${d.team_b}`)
            .attr("cx", (d, i) => match_Xposition(d, i) + group_scale(1))
            .attr("cy", (d, i) => match_Yposition(d, i))
            .attr("r", (d, i) => match_result_scale(d.size))
            .style("fill", (d, i) => match_color_scale(d.team_b_result))
            .style("stroke", (d, i) => match_color_scale(d.team_b_result))
            // .style("fill", (d, i) => (d.team_b_result == "Winner" ? color_scale(d.team_b) : color_scale(d.team_a)))
            // .style("stroke", (d, i) => (d.team_b_result == "Winner" ? color_scale(d.team_b) : color_scale(d.team_a)))
            .style("stroke-width", 1)
            .style("fill-opacity", 0.4)
            .style("stroke-opacity", 0.7);
    });

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 08. Connection lines Functions /////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var connection_line;
    var connection_lines_head;

    // console.log(d1_line[4].random);

    // Position Functions
    let line_x1 = function (d, i) {
        let p1 = group_scale(0);

        let x_delta = (d.random - 0.5) / varation;
        let y_delta = (d.random - 0.5) / varation;

        let p2 = (subGroups_scale(d.decade) + y_delta) * Math.cos(angleMatchSlice * d.year_n + x_delta - Math.PI / 2);
        let p = p1 + p2;
        return p;
    };
    let line_y1 = function (d, i) {
        let p1 = 0;

        let x_delta = (d.random - 0.5) / varation;
        let y_delta = (d.random - 0.5) / varation;

        let p2 = (subGroups_scale(d.decade) + y_delta) * Math.sin(angleMatchSlice * d.year_n + x_delta - Math.PI / 2);
        let p = p1 + p2;
        return p;
    };
    let line_x2 = function (d, i) {
        let p1 = group_scale(1);

        let x_delta = (d.random - 0.5) / varation;
        let y_delta = (d.random - 0.5) / varation;

        let p2 = (subGroups_scale(d.decade) + y_delta) * Math.cos(angleMatchSlice * d.year_n + x_delta - Math.PI / 2);
        let p = p1 + p2;
        return p;
    };
    let line_y2 = function (d, i) {
        let p1 = 0;

        let x_delta = (d.random - 0.5) / varation;
        let y_delta = (d.random - 0.5) / varation;

        let p2 = (subGroups_scale(d.decade) + y_delta) * Math.sin(angleMatchSlice * d.year_n + x_delta - Math.PI / 2);
        let p = p1 + p2;
        return p;
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 11. Flags ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Position Functions

    // // Text Groups
    let flagGroups_head = mainGroup
        .append("g")
        .classed("flag-groups", true)
        .attr("transform", (d, i) => `translate(0, 260)`)
        .each(function (d, i) {
            // left
            d3.select(this)
                .append("circle")
                .attr("cx", (d, i) => group_scale(0))
                .attr("cy", -260)
                .attr("r", 20)
                .style("fill", "white")
                .style("stroke", "black")
                .style("opacity", 0.5);

            d3.select(this)
                .append("image")
                .attr("id", "id-head-flag-a")
                .attr("x", (d, i) => group_scale(0) - 15)
                .attr("y", -260 - 15)
                .attr("width", "30px")
                .attr("height", "30px")
                .attr("href", `flags/South_Africa.png`)
                .style("opacity", 1);

            // right
            d3.select(this)
                .append("circle")
                .attr("cx", (d, i) => group_scale(1))
                .attr("cy", -260)
                .attr("r", 20)
                .style("fill", "white")
                .style("stroke", "black")
                .style("opacity", 0.5);

            d3.select(this)
                .append("image")
                .attr("id", "id-head-flag-b")
                .attr("x", (d, i) => group_scale(1) - 15)
                .attr("y", -260 - 15)
                .attr("width", "30px")
                .attr("height", "30px")
                .attr("href", `flags/England.png`)
                .style("opacity", 1);

            // annotations
            d3.select(this)
                .append("text")
                .style("font-size", "12px")
                .attr("x", (d, i) => group_scale(0))
                .attr("y", -225)
                .style("text-align", "center")
                .style("text-anchor", "middle")
                .text("1970-1979");

            d3.select(this)
                .append("text")
                .style("font-size", "12px")
                .attr("x", (d, i) => group_scale(0))
                .attr("y", -175)
                .style("text-align", "center")
                .style("text-anchor", "middle")
                .text("1990-1999");

            d3.select(this)
                .append("text")
                .style("font-size", "12px")
                .attr("x", (d, i) => group_scale(0))
                .attr("y", -130)
                .style("text-align", "center")
                .style("text-anchor", "middle")
                .text("2010-2019");

            d3.select(this)
                .append("text")
                .style("font-size", "12px")
                .attr("x", (d, i) => group_scale(0))
                .attr("y", -90)
                .style("text-align", "center")
                .style("text-anchor", "middle")
                .text("2020-2023");

            d3.select(this)
                .append("text")
                .style("font-size", "12px")
                .attr("x", (d, i) => group_scale(1))
                .attr("y", -225)
                .style("text-align", "center")
                .style("text-anchor", "middle")
                .text("1970-1979");

            d3.select(this)
                .append("text")
                .style("font-size", "12px")
                .attr("x", (d, i) => group_scale(1))
                .attr("y", -175)
                .style("text-align", "center")
                .style("text-anchor", "middle")
                .text("1990-1999");

            d3.select(this)
                .append("text")
                .style("font-size", "12px")
                .attr("x", (d, i) => group_scale(1))
                .attr("y", -130)
                .style("text-align", "center")
                .style("text-anchor", "middle")
                .text("2010-2019");

            d3.select(this)
                .append("text")
                .style("font-size", "12px")
                .attr("x", (d, i) => group_scale(1))
                .attr("y", -90)
                .style("text-align", "center")
                .style("text-anchor", "middle")
                .text("2020-2023");

            d3.select(this)
                .append("text")
                .attr("x", 0)
                .attr("y", -420)
                .style("fill", "grey")
                .style("font-size", "16px")
                .style("font-weight", "500")
                .style("text-align", "center")
                .style("text-anchor", "middle")
                .text("Hover/Tap on each circle");

            d3.select(this)
                .append("text")
                .attr("x", 0)
                .attr("y", -398)
                .style("fill", "grey")
                .style("font-size", "16px")
                .style("font-weight", "500")
                .style("text-align", "center")
                .style("text-anchor", "middle")
                .text("to see match details");

            d3.select(this)
                .append("text")
                .style("font-size", "10px")
                .attr("x", 0)
                .attr("y", -86)
                .style("fill", "4d1c3e")
                .style("font-size", "18px")
                .style("font-weight", "500")
                .style("text-align", "center")
                .style("text-anchor", "middle")
                .text("Match colour code");

            const colors = ["#320071", "grey", "#FF009B"];

            d3.select(this)
                .selectAll("circle.annotation-circles")
                .data([-1, 0, 1])
                .enter()
                .append("circle")
                .attr("cx", (d) => d * 60)
                .attr("cy", -55)
                .attr("r", 10)
                .style("fill", (d, i) => colors[i])
                .style("stroke", (d, i) => colors[i])
                .style("stroke-width", 1.6)
                .style("fill-opacity", 0.6);

            d3.select(this)
                .append("text")
                .attr("x", 0)
                .attr("y", -20)
                .style("fill", "4d1c3e")
                .style("font-size", "16px")
                .style("text-align", "center")
                .style("text-anchor", "middle")
                .text("Won | No result | Lost");
        });

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 10. Radial Text ////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 09. Connection lines ///////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // change labels
    // d3.select("#label_New_Zealand").text("New Zealand").attr("transform", "translate(0,0)");
    // d3.select("#label_South_Korea").text("South Korea").attr("transform", "translate(0,-5)");
    // d3.select("#label_United_States").text("US").attr("transform", "translate(0,0)");
    // d3.select("#label_Costa_Rica").text("Costa Rica").attr("transform", "translate(0,0)");

    // Connection lines
    connection_lines_head = mainGroup
        .selectAll("line.connection-line-heads-head")
        .data(worldcup_matches_long)
        .join("path")
        .classed("connection-line-heads-head", true)
        .attr("class", (d, i) => `line_serial_${d.serial} a_team_l_${d.team_a} b_team_l_${d.team_b}`) //
        .attr("d", (d, i) => `M ${line_x1(d, i)} ${line_y1(d, i)} Q 0 0 ${line_x2(d, i)} ${line_y2(d, i)}`)
        .style("stroke-width", 1)
        .style("stroke", "grey")
        .style("fill", "none")
        .style("opacity", 0.2)
        .style("stroke-linecap", "round");
    // .lower();

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 10. Default Text ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const default_text_head = mainGroup
        .append("g")
        .attr("id", "id-head-default-text")
        .style("transform", "translate(0px,-390px)")
        .style("font-size", "18px")
        .style("text-align", "center")
        .style("text-anchor", "middle")
        .style("fill", "pink")
        .style("opacity", 0)
        .each(function (d, i) {
            // central circle
            d3.select(this)
                .append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 200)
                .attr("class", "id-head-central-circle")
                .style("fill", "white")
                .style("stroke", "black")
                .style("stroke-opacity", 0.6)
                .style("fill-opacity", 0.3);

            d3.select(this)
                .append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 190)
                .style("fill", "white")
                .style("stroke", "black")
                .style("stroke-opacity", 0.6)
                .style("fill-opacity", 0.3);

            d3.select(this)
                .append("image")
                .attr("x", -75)
                .attr("y", -75)
                .attr("width", "150px")
                .attr("height", "150px")
                .style("opacity", 1);

            d3.select(this)
                .append("text")
                .attr("y", -20)
                .style("fill", "grey")
                .style("font-size", "26px")
                .style("font-weight", "400")
                .style("opacity", 1)
                .text("The selected teams have not");
            d3.select(this)
                .append("text")
                .attr("y", 10)
                .style("fill", "grey")
                .style("font-size", "26px")
                .style("font-weight", "400")
                .style("opacity", 1)
                .text("played against one another");
            d3.select(this)
                .append("text")
                .attr("y", 40)
                .style("fill", "grey")
                .style("font-size", "26px")
                .style("font-weight", "400")
                .style("opacity", 1)
                .text("in the past");
        });
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // // 11. Match Text /////////////////////////////////////////////////////////////////////////////////////////////////
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const match_text_head = mainGroup
        .append("g")
        .attr("id", "id-head-g-text")
        .style("transform", "translate(0px,-390px)")
        .style("font-size", "22px")
        .style("text-align", "center")
        .style("text-anchor", "middle")
        .style("fill", "black") //ff0062
        .style("opacity", 0)
        .each(function (d, i) {
            // central circle
            d3.select(this)
                .append("circle")
                .attr("r", 200)
                .style("fill", "grey")
                .style("stroke", "black")
                .style("stroke-opacity", 0.2)
                .style("fill-opacity", 0.08);

            d3.select(this)
                .append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 190)
                .style("fill", "white")
                .style("stroke", "black")
                .style("stroke-opacity", 0.2)
                .style("fill-opacity", 0.3);

            d3.select(this).append("text").attr("y", -50).style("fill", "grey").text(" : ");

            // team a
            d3.select(this)
                .append("text")
                .attr("id", "id-head-team-a")
                .attr("x", -10)
                .attr("y", -50)
                .style("font-weight", "700")
                .style("text-align", "right")
                .style("text-anchor", "end")
                .text("Team A");

            // team b
            d3.select(this)
                .append("text")
                .attr("id", "id-head-team-b")
                .attr("x", 10)
                .attr("y", -50)
                .style("font-weight", "700")
                .style("text-align", "left")
                .style("text-anchor", "start")
                .text("Team B");

            // result desc
            // d3.select(this)
            //     .append("text")
            //     .attr("y", -10)
            //     .style("font-size", "20px")
            //     .style("font-weight", "400")
            //     .style("fill", "grey")
            //     .text(" : ");

            // team a result
            // d3.select(this)
            //     .append("text")
            //     .attr("id", "id-result-a")
            //     .attr("x", -10)
            //     .attr("y", -10)
            //     .style("font-size", "20px")
            //     .style("font-weight", "400")
            //     .style("text-align", "right")
            //     .style("text-anchor", "end")
            //     .style("fill", "grey")
            //     .text("Score A");

            // team b result
            // d3.select(this)
            //     .append("text")
            //     .attr("id", "id-result-b")
            //     .attr("x", 10)
            //     .attr("y", -10)
            //     .style("font-size", "20px")
            //     .style("font-weight", "400")
            //     .style("text-align", "left")
            //     .style("text-anchor", "start")
            //     .style("fill", "grey")
            //     .text("Score B");

            // score
            d3.select(this).append("text").attr("id", "id-result").attr("y", 0).style("fill", "grey").text("Score");
            d3.select(this).append("text").attr("id", "id-result-txt").attr("y", 30).style("fill", "grey").text("Score");

            d3.select(this)
                .append("text")
                .attr("id", "id-head-score")
                .attr("x", 0)
                .attr("y", 70)
                .style("font-size", "26px")
                .style("font-weight", "700")
                .text("Scores");

            // Date
            d3.select(this).append("text").attr("id", "id-head-country").attr("y", 140).style("font-size", "20px").text("Date");

            // team a and b flags
            d3.select(this)
                .append("rect")
                .attr("x", -72.5)
                .attr("y", -134)
                .attr("width", 45)
                .attr("height", 28)
                .style("fill", "white")
                .style("stroke", "black")
                .style("fill-opacity", 0.3)
                .style("opacity", 0.6);

            d3.select(this)
                .append("rect")
                .attr("x", 27.5)
                .attr("y", -134)
                .attr("width", 45)
                .attr("height", 28)
                .style("fill", "white")
                .style("stroke", "black")
                .style("fill-opacity", 0.3)
                .style("opacity", 0.6);

            d3.select(this)
                .append("image")
                .attr("id", "id-head-team-a-flag")
                .attr("x", -70)
                .attr("y", -140)
                .attr("width", "40px")
                .attr("height", "40px")
                .style("opacity", 1)
                .attr("href", "flags/South_Africa.png");

            d3.select(this)
                .append("image")
                .attr("id", "id-head-team-b-flag")
                .attr("x", 30)
                .attr("y", -140)
                .attr("width", "40px")
                .attr("height", "40px")
                .style("opacity", 1)
                .attr("href", "flags/England.png");
        });

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // // 12. Central Text STATS /////////////////////////////////////////////////////////////////////////////////////////
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const stats_text_head = mainGroup
        .append("g")
        .attr("id", "id-head-stats-text")
        .style("transform", "translate(0px,-390px)")
        .style("font-size", "22px")
        .style("text-align", "center")
        .style("text-anchor", "middle")
        .style("fill", "black")
        .style("opacity", 1)
        .each(function (d, i) {
            // central circle
            d3.select(this)
                .append("circle")
                .attr("r", 200)
                .style("fill", "grey")
                .style("stroke", "black")
                .style("stroke-opacity", 0.2)
                .style("fill-opacity", 0.08);

            d3.select(this)
                .append("circle")
                .attr("r", 190)
                .style("fill", "white")
                .style("stroke", "black")
                .style("stroke-opacity", 0.2)
                .style("fill-opacity", 0.3);

            d3.select(this).append("text").attr("y", -50).style("fill", "grey").text(" : ");

            // team a
            d3.select(this)
                .append("text")
                .attr("id", "id-head-team-stats-a")
                .attr("x", -10)
                .attr("y", -50)
                .style("font-weight", "700")
                .style("text-align", "right")
                .style("text-anchor", "end")
                .text("Team A");

            // team b
            d3.select(this)
                .append("text")
                .attr("id", "id-head-team-stats-b")
                .attr("x", 10)
                .attr("y", -50)
                .style("font-weight", "700")
                .style("text-align", "left")
                .style("text-anchor", "start")
                .text("Team B");

            // score
            d3.select(this).append("text").attr("y", 60).style("fill", "grey").text(" : ");

            d3.select(this)
                .append("text")
                .attr("id", "id-head-wins-a")
                .attr("x", -10)
                .attr("y", 60)
                .style("fill", "#320071")
                .style("text-align", "right")
                .style("text-anchor", "end")
                .text("Scores");

            d3.select(this)
                .append("text")
                .attr("id", "id-head-wins-b")
                .attr("x", 10)
                .attr("y", 60)
                .style("fill", "#FF009B")
                .style("text-align", "left")
                .style("text-anchor", "start")
                .text("Scores");

            ////////////////////////////////
            // stats
            d3.select(this)
                .append("rect")
                .attr("x", -80)
                .attr("y", 80)
                .attr("height", 15)
                .attr("width", 40)
                .attr("id", "rect-stats-wins")
                .style("fill", "#320071")
                .style("opacity", 0.8);

            d3.select(this)
                .append("rect")
                .attr("x", 20)
                .attr("y", 80)
                .attr("height", 15)
                .attr("width", 30)
                .attr("id", "rect-stats-losses")
                .style("fill", "#FF009B")
                .style("opacity", 0.8);

            // sep line
            d3.select(this)
                .append("line")
                .attr("x1", -10)
                .attr("y1", 70)
                .attr("x2", -10)
                .attr("y2", 105)
                .attr("id", "sep-stats-line1")
                .style("stroke", "black")
                .style("opacity", 0.9);

            d3.select(this)
                .append("line")
                .attr("x1", 10)
                .attr("y1", 70)
                .attr("x2", 10)
                .attr("y2", 105)
                .attr("id", "sep-stats-line2")
                .style("stroke", "black")
                .style("opacity", 0.9);

            // sep line text
            d3.select(this)
                .append("text")
                .attr("x", -65)
                .attr("y", 120)
                .attr("id", "sep-stats-txt1")
                .style("fill", "#320071")
                .style("font-size", "16px")
                .style("font-weight", "600")
                .style("opacity", 1)
                .text("50%");

            d3.select(this)
                .append("text")
                .attr("x", 65)
                .attr("y", 120)
                .attr("id", "sep-stats-txt2")
                .style("fill", "#FF009B")
                .style("font-size", "16px")
                .style("font-weight", "600")
                .style("opacity", 1)
                .text("50%");

            // total matches line
            d3.select(this)
                .append("text")
                .attr("y", 5)
                .attr("id", "t-stats-matches")
                .style("fill", "grey")
                .style("font-size", "26px")
                .style("font-weight", "500")
                .style("opacity", 1)
                .text("Total matches");

            // team a and b flags
            d3.select(this)
                .append("rect")
                .attr("x", -72.5)
                .attr("y", -134)
                .attr("width", 45)
                .attr("height", 28)
                .style("fill", "white")
                .style("stroke", "black")
                .style("fill-opacity", 0.3)
                .style("opacity", 0.6);

            d3.select(this)
                .append("rect")
                .attr("x", 27.5)
                .attr("y", -134)
                .attr("width", 45)
                .attr("height", 28)
                .style("fill", "white")
                .style("stroke", "black")
                .style("fill-opacity", 0.3)
                .style("opacity", 0.6);

            d3.select(this)
                .append("image")
                .attr("id", "stats-team-a-flag")
                .attr("x", -70)
                .attr("y", -140)
                .attr("width", "40px")
                .attr("height", "40px")
                .style("opacity", 1)
                .attr("href", "flags/South_Africa.png");

            d3.select(this)
                .append("image")
                .attr("id", "stats-team-b-flag")
                .attr("x", 30)
                .attr("y", -140)
                .attr("width", "40px")
                .attr("height", "40px")
                .style("opacity", 1)
                .attr("href", "flags/England.png");

            // No result
            // total matches line
            d3.select(this)
                .append("text")
                .attr("y", 152)
                .attr("id", "no-result-matches")
                .style("fill", "grey")
                .style("font-size", "16px")
                // .style("font-weight", "500")
                .style("opacity", 1)
                .text("No reusults");
        });
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // // 12. Events /////////////////////////////////////////////////////////////////////////////////////////////////////
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    refCircles.lower();
    //////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////
    // mouse over
    function match_mouseover_head() {
        let match_data = d3.select(this).data()[0];
        // console.log(match_data);

        default_text_head.style("opacity", 0);
        match_text_head.style("opacity", 1);
        // // text
        d3.select("#id-head-team-stats-a").text(`${match_data.team_a_txt}`);
        d3.select("#id-head-team-stats-b").text(`${match_data.team_b_txt}`);
        d3.select("#id-head-team-a").text(`${match_data.team_a_txt}`);
        d3.select("#id-head-team-b").text(`${match_data.team_b_txt}`);

        d3.select("#id-head-score").text(`${match_data.result}`);
        // d3.select("#id-result-a").text(`${match_data.team_a_result}`);
        // d3.select("#id-result-b").text(`${match_data.team_b_result}`);
        d3.select("#id-result").text(
            `${
                match_data.team_a_result == "Winner"
                    ? match_data.team_a_txt
                    : match_data.team_b_result == "Winner"
                    ? match_data.team_b_txt
                    : ""
            }`
        );
        d3.select("#id-result-txt").text(
            `${match_data.team_a_result == "No result" ? "No result" : match_data.team_b_result == "Tied" ? "No result" : "won by"}`
        );

        d3.select("#id-head-country").text(`${month_scale(match_data.month)} ${match_data.day}, ${match_data.year}`);
        d3.select("#id-head-team-a-flag").attr("href", `flags/${match_data.team_a}.png`);
        d3.select("#id-head-team-b-flag").attr("href", `flags/${match_data.team_b}.png`);

        // connection line
        connection_line = mainGroup
            .selectAll("line.connection-line-head")
            .data(worldcup_matches_long.filter((d) => d.serial == match_data.serial && d.team_a == match_data.team_a))
            .enter()
            .append("path")
            .classed("connection-line-head", true)
            .attr("d", (d) => `M ${line_x1(d)} ${line_y1(d)} Q 0 0 ${line_x2(d)} ${line_y2(d)}`)
            .style("stroke-width", 2)
            .style("stroke", `black`)
            .style("fill", "none")
            .style("opacity", 1)
            .style("stroke-linecap", "round")
            .raise();

        // circles change on hover or tap
        d3.selectAll(`.serial_${match_data.serial}`)
            .style("fill-opacity", 1)
            .style("stroke-opacity", 1)
            .style("stroke", "black")
            .attr("r", (d, i) => match_result_scale(d.size) + 2)
            .raise();

        match_text_head.raise();
        matchCircles1.raise();
        matchCircles2.raise();

        d3.selectAll(".t-info").style("opacity", 0);

        // stats
        stats_text_head.style("opacity", 0);

        // default text
        default_text_head.style("opacity", 0);
    } //end of mouse over

    // mouse leave
    function match_mouseleave_head() {
        let match_data = d3.select(this).data()[0];
        match_text_head.style("opacity", 0);

        connection_lines_head
            .style("stroke-width", (d) => match_line_scale(d.size))
            .style("stroke", "grey")
            .style("opacity", 0.2)
            .style("stroke-linecap", "round");

        connection_line.remove();

        // Match Circles
        d3.selectAll(".match-circles-head")
            .style("fill-opacity", 0.4)
            .style("stroke-opacity", 0.7)
            .attr("r", (d, i) => match_result_scale(d.size) + 0);

        d3.selectAll(".match-circles-head-1")
            .style("stroke", (d, i) => match_color_scale(d.team_a_result))
            .attr("r", (d, i) => match_result_scale(d.size));

        d3.selectAll(".match-circles-head-2")
            .style("stroke", (d, i) => match_color_scale(d.team_b_result))
            .attr("r", (d, i) => match_result_scale(d.size));

        // goals
        // d3.selectAll("circle.goals-a").style("opacity", 0);
        // d3.selectAll("circle.goals-b").style("opacity", 0);

        // default text
        default_text_head.style("opacity", 0);
        stats_text_head.style("opacity", 1);
    }

    d3.selectAll("circle.match-circles-head").on("mouseover", match_mouseover_head).on("mouseleave", match_mouseleave_head);
    refCircles.lower();

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 00. dropdown ///////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Intial selection

    d3.selectAll(`.match-circles-head-1, .match-circles-head-2`).raise();
    d3.selectAll(`.match-circles-head-1, .match-circles-head-2`).style("visibility", "hidden");
    d3.selectAll(`.a_team_c_South_Africa.b_team_c_England`).style("visibility", "visible");

    connection_lines_head.style("visibility", "hidden");
    d3.selectAll(`.a_team_l_South_Africa.b_team_l_England`).style("visibility", "visible");

    // Team selection functions
    function team_selection(team_x, team_y) {
        d3.selectAll(`.match-circles-head-1, .match-circles-head-2`).style("visibility", "hidden");
        d3.selectAll(`.a_team_c_${team_x}.b_team_c_${team_y}`).style("visibility", "visible");

        connection_lines_head.style("visibility", "hidden");
        d3.selectAll(`.a_team_l_${team_x}.b_team_l_${team_y}`).style("visibility", "visible");

        // flags
        d3.select("#id-head-flag-a").attr("href", `flags/${team_x}.png`);
        d3.select("#id-head-flag-b").attr("href", `flags/${team_y}.png`);
    }

    // stats show
    function teams_stats_show_head(team_x, team_y) {
        // team text groups
        let team_summary_head = worldcup_matches_stats.filter((d) => d.team_a == team_x && d.team_b == team_y)[0];
        let is_team_summary_head = worldcup_matches_stats.filter((d) => d.team_a == team_x && d.team_b == team_y).length;

        // console.log(team_summary_head);

        if (is_team_summary_head == 0) {
            stats_text_head.style("opacity", 0);
            default_text_head.style("opacity", 1);

            // console.log(team_summary);
        } else {
            stats_text_head.style("opacity", 1);
            default_text_head.style("opacity", 0);

            d3.select("#id-head-team-stats-a").text(`${team_summary_head.team_a_txt}`);
            d3.select("#id-head-team-stats-b").text(`${team_summary_head.team_b_txt}`);

            // console.log(team_summary_head);

            d3.select("#id-head-wins-a")
                .text(`${team_summary_head.winner} wins`)
                .style("fill", `${team_summary_head.winning_perc > team_summary_head.losing_perc ? "#320071" : "#FF009B"}`);

            d3.select("#id-head-wins-b")
                .text(`${team_summary_head.loser} wins`)
                .style("fill", `${team_summary_head.winning_perc > team_summary_head.losing_perc ? "#FF009B" : "#320071"}`);

            d3.select("#t-stats-matches").text(`${team_summary_head.matches} matches`);
            if (team_summary_head.draw == 1) {
                d3.select("#no-result-matches").text(`${team_summary_head.draw} no result`);
            } else {
                d3.select("#no-result-matches").text(`${team_summary_head.draw} no results`);
            }

            // stats rect and lines
            d3.select("#rect-stats-wins")
                .attr("width", `${team_summary_head.winning_perc * 1.6}`)
                .style("fill", `${team_summary_head.winning_perc > team_summary_head.losing_perc ? "#320071" : "#FF009B"}`);

            d3.select("#rect-stats-losses")
                .attr("x", `${-80 + team_summary_head.winning_perc * 1.6}`)
                .attr("width", `${team_summary_head.losing_perc * 1.6}`)
                .style("fill", `${team_summary_head.winning_perc > team_summary_head.losing_perc ? "#FF009B" : "#320071"}`);

            d3.select("#sep-stats-line1")
                .attr("x1", `${-80 + team_summary_head.winning_perc * 1.6}`)
                .attr("x2", `${-80 + team_summary_head.winning_perc * 1.6}`);

            d3.select("#sep-stats-txt1")
                // .attr("x", `${-80 + team_summary_head.winning_perc * 1.6}`)
                .text(`${team_summary_head.winning_perc}%`)
                .style("fill", `${team_summary_head.winning_perc > team_summary_head.losing_perc ? "#320071" : "#FF009B"}`);

            d3.select("#sep-stats-line2")
                .attr("x1", `${-80 + team_summary_head.winning_perc * 1.6}`)
                .attr("x2", `${-80 + team_summary_head.winning_perc * 1.6}`);

            d3.select("#sep-stats-txt2")
                // .attr("x", `${-80 + team_summary_head.winning_perc * 1.6}`)
                .text(`${team_summary_head.losing_perc}%`)
                .style("fill", `${team_summary_head.winning_perc > team_summary_head.losing_perc ? "#FF009B" : "#320071"}`);

            d3.select("#stats-team-a-flag").attr("href", `flags/${team_x}.png`);
            d3.select("#stats-team-b-flag").attr("href", `flags/${team_y}.png`);

            d3.select("#id-head-team-stats-a").text("South Africa");
            d3.select("#id-head-team-stats-b").text("England");
        }
    }
    teams_stats_show_head("South_Africa", "England");

    /* When the user clicks on the button,
        toggle between hiding and showing the dropdown content */
    var a_team = document.getElementById("team-a");
    var b_team = document.getElementById("team-b");
    var atext, avalue, btext, bvalue;

    // console.log(a_team);
    //////////////////////////////////////////////////
    var x, i, j, l, ll, selElmnt, a, b, c;
    /* Look for any elements with the class "custom-select": */
    x = document.getElementsByClassName("custom-select-2");
    l = x.length;
    for (i = 0; i < l; i++) {
        selElmnt = x[i].getElementsByTagName("select")[0];
        ll = selElmnt.length;
        /* For each element, create a new DIV that will act as the selected item: */
        a = document.createElement("DIV");
        a.setAttribute("class", "select-selected");
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        x[i].appendChild(a);
        /* For each element, create a new DIV that will contain the option list: */
        b = document.createElement("DIV");
        b.setAttribute("class", "select-items select-hide");
        for (j = 1; j < ll; j++) {
            /* For each option in the original select element,
          create a new DIV that will act as an option item: */
            c = document.createElement("DIV");
            c.innerHTML = selElmnt.options[j].innerHTML;
            c.addEventListener("click", function (e) {
                /* When an item is clicked, update the original select box,
              and the selected item: */
                var y, i, k, s, h, sl, yl;
                s = this.parentNode.parentNode.getElementsByTagName("select")[0];
                sl = s.length;
                h = this.parentNode.previousSibling;
                for (i = 0; i < sl; i++) {
                    if (s.options[i].innerHTML == this.innerHTML) {
                        s.selectedIndex = i;
                        h.innerHTML = this.innerHTML;
                        y = this.parentNode.getElementsByClassName("same-as-selected");
                        yl = y.length;
                        for (k = 0; k < yl; k++) {
                            y[k].removeAttribute("class");
                        }
                        this.setAttribute("class", "same-as-selected");
                        break;
                    }
                }
                h.click();
            });
            b.appendChild(c);
        }
        x[i].appendChild(b);
        a.addEventListener("click", function (e) {
            /* When the select box is clicked, close any other select boxes,
          and open/close the current select box: */
            e.stopPropagation();
            closeAllSelect(this);
            this.nextSibling.classList.toggle("select-hide");
            this.classList.toggle("select-arrow-active");

            atext = a_team.options[a_team.selectedIndex].text;
            avalue = a_team.options[a_team.selectedIndex].value;
            btext = b_team.options[b_team.selectedIndex].text;
            bvalue = b_team.options[b_team.selectedIndex].value;
            //log value
            // console.log(atext, btext);
            // console.log(avalue, bvalue);

            // selection function
            team_selection(avalue, bvalue);
            teams_stats_show_head(avalue, bvalue);

            d3.select("#id-head-team-stats-a").text(`${atext}`);
            d3.select("#id-head-team-stats-b").text(`${btext}`);
        });
    }

    function closeAllSelect(elmnt) {
        /* A function that will close all select boxes in the document,
        except the current select box: */
        var x,
            y,
            i,
            xl,
            yl,
            arrNo = [];
        x = document.getElementsByClassName("select-items");
        y = document.getElementsByClassName("select-selected");
        xl = x.length;
        yl = y.length;
        for (i = 0; i < yl; i++) {
            if (elmnt == y[i]) {
                arrNo.push(i);
            } else {
                y[i].classList.remove("select-arrow-active");
            }
        }
        for (i = 0; i < xl; i++) {
            if (arrNo.indexOf(i)) {
                x[i].classList.add("select-hide");
            }
        }
    }

    //     /* If the user clicks anywhere outside the select box,
    //   then close all select boxes: */
    document.addEventListener("click", closeAllSelect);
} // end of the dataviz
