const fs = require('fs');
let content = fs.readFileSync('src/app/App.tsx', 'utf-8');

const replacements = [
    ['onNav("product", undefined, undefined, relatedProduct.id.toString());', '(onNav as any)("product", undefined, undefined, relatedProduct.id.toString());'],
    ['onNav("brand", undefined, undefined, product.brand)', '(onNav as any)("brand", undefined, undefined, product.brand)'],
    ['product.specs?.showStockCount === true', 'String(product.specs?.showStockCount) === "true"'],
    ['id: "seeded-1",', 'id: 999999 as any,'],
    ['onNav={navigate}', 'onNav={navigate as any}'],
    ['import { ShoppingCart, Heart, Search, User, Menu, X, ChevronRight, Star, ChevronLeft, Plus, Minus, MapPin, Shield, Package, Truck, Check, Facebook, Twitter, Instagram, Youtube, Phone, MessageCircle, Mail, Grid, List, LogOut, ArrowRight, TrendingUp, Filter } from "lucide-react";', 'import { ShoppingCart, Heart, Search, User, Menu, X, ChevronRight, Star, ChevronLeft, Plus, Minus, MapPin, Shield, Package, Truck, Check, Facebook, Twitter, Instagram, Youtube, Phone, MessageCircle, Mail, Grid, List, LogOut, ArrowRight, TrendingUp, Filter, Share2 } from "lucide-react";']
];

for (const [old, newStr] of replacements) {
    content = content.split(old).join(newStr);
}

fs.writeFileSync('src/app/App.tsx', content, 'utf-8');
console.log("Done");
