"use strict";

import unit from "../app/master/unit.js";
import fiscalyear from "../app/master/fiscalyear.js";
import customer from "../app/master/customer.js";
import vendor from "../app/master/vendor.js";
import productClassification from "../app/master/product-classification.js";
import product from "../app/product/product.js";

$(() => {
    $(document).on("click", '[data-nav="unit"]', function () {
       unit.init();
    });

    $(document).on("click", '[data-nav="fiscalyear"]', function () {
        fiscalyear.init();
    });
    $(document).on("click", '[data-nav="customer"]', function () {
        customer.init();
    });
    $(document).on("click", '[data-nav="vendor"]', function () {
        vendor.init();
    });
    $(document).on("click", '[data-nav="product-classification"]', function () {
        productClassification.init();
    });
    $(document).on("click", '[data-nav="product"]', function () {
        product.init();
    });
    

});