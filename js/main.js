//loading
// function startProgress() {
//   const preloader = document.querySelector("#preloader");
//   // 监听加载完成事件
//   window.addEventListener("load", () => {
//     preloader.style.opacity = 0;
//     document.getElementById('tricks-view').style.display = 'block';
//     setTimeout(() => {
//         preloader.style.display = 'none';
//     }, 500);
//   });
// }
// startProgress();
// window.onload = startProgress();

setTimeout(() => {
    preloader.style.opacity = 0;
    setTimeout(() => {
        preloader.style.display = 'none';
        document.getElementById('tricks-view').style.display = 'block';
        
        // 主页面加载完成后，通知NFT Minter可以开始计时
        if (window.nftMinter && window.nftMinter.onMainPageLoaded) {
            window.nftMinter.onMainPageLoaded();
        }
    }, 400);
}, 1000);



// You have the license to use this code in your projects but not redistribute it to others
$(".tricks-view").one("inview", function (event, isInView) {
  if (isInView) {
    // UPDATE THESE VARIABLES
    let sWidth = $(window).width();
    let pad;
    if(sWidth > 767){pad=96;}else{pad=64;}

    let tricksAmount = 20;
    let tricksMin = 0.65;
    let tricksMax = 1.3;
    var w = window.innerWidth - pad;
    var h = window.innerHeight - pad;
    const numCircles = tricksAmount;
    let ground;
    let wall1;
    let wall2;
    const content = document.querySelector(".tricks-canvas");
    let elements = [];
    let tricksCircles = [];
    window.addEventListener("resize", (e) => {
        sWidth = $(window).width();
        if(sWidth > 767){pad=96;}else{pad=64;}
      w = window.innerWidth - pad;
      h = window.innerHeight - pad;
      engine.render.canvas.width = w;
      engine.render.canvas.height = h;
      Matter.Body.setPosition(wall2, Matter.Vector.create(w + 30, h * 0.5));
      Matter.Body.setPosition(ground, Matter.Vector.create(w * 0.5, h + 30));
    });
    var engine = Matter.Engine.create(content, {
      render: {
        options: {
          width: w,
          height: h,
          wireframes: false,
          background: "transparent",
        },
      },
    });
    window.engine = engine;
    var mouseConstraint = Matter.MouseConstraint.create(engine, {
      constraint: {
        render: {
          visible: false,
        },
        stiffness: 1,
      },
    });
    let tricksArea = document.querySelector(".tricks-elements");
    class tricksCircle {
      constructor() {
        var x = Math.random() * w;
        var y = Math.random() * -h;
        var base = w / 50;
        if (base < 5) base = 5;
        if (base > 10) base = 10;
        var multiplier = w / 10;
        if (multiplier < 50) multiplier = 50;
        if (multiplier > 100) multiplier = 100;
        let tricksRandom = (
          Math.random() * (tricksMin - tricksMax) +
          tricksMax
        ).toFixed(1);
        this.radius = base + tricksRandom * multiplier;
        this.body = Matter.Bodies.circle(x, y, this.radius, {
          render: {
            fillStyle: "transparent",
          },
        });
        this.element = document.createElement("div");
        this.element.className = "tricks-circle";
        this.element.style.width = this.radius * 2 + "px";
        this.element.style.height = this.radius * 2 + "px";
        this.cornea = document.createElement("div");
        this.element.appendChild(this.cornea);
        tricksArea.appendChild(this.element);
      }
      update() {
        this.pos = {
          x: this.body.position.x + 60,
          y: this.body.position.y + 60,
        };
        this.element.style.transform = `translate(${
          this.pos.x - this.radius - 8
        }px, ${this.pos.y - this.radius - 8}px)`;
      }
      lookAt(pos) {
        let diff = {
          x: pos.x - this.pos.x,
          y: pos.y - this.pos.y,
        };
        let polar = [
          Math.sqrt(diff.x * diff.x + diff.y * diff.y),
          Math.atan2(diff.y, diff.x),
        ];
        let dist = polar[0] < this.radius * 0.5 ? polar[0] : this.radius * 0.5;
        this.cornea.style.transform = `translate(${
          Math.cos(polar[1]) * dist
        }px, ${Math.sin(polar[1]) * dist}px)`;
        window.cornea = `translate(${Math.cos(polar[1]) * dist}px, ${
          Math.sin(polar[1]) * dist
        }px)`;
        window.polar = polar;
      }
    }
    
    
    let mousepos = {
      x: 0,
      y: 0,
    };
    window.addEventListener("pointermove", (e) => {
      mousepos = {
        x: e.clientX,
        y: e.clientY,
      };
    });
    for (var i = 0; i < numCircles; i++) {
      tricksCircles.push(new tricksCircle());
    }
    
    ground = Matter.Bodies.rectangle(w / 2, h + 30, 50000, 60, {
      isStatic: true,
    });
    wall1 = Matter.Bodies.rectangle(-30, h / 2, 60, h * 2, {
      isStatic: true,
    });
    wall2 = Matter.Bodies.rectangle(w + 30, h / 2, 60, h * 2, {
      isStatic: true,
    });
    window.wall2 = wall2;
    elements.push(ground);
    elements.push(wall1);
    elements.push(wall2);
    Matter.World.add(
      engine.world,
      tricksCircles.map((trickscircle) => trickscircle.body).concat(elements)
    );
    Matter.World.add(engine.world, mouseConstraint);
    Matter.Engine.run(engine);
    Matter.Events.on(engine, "afterUpdate", () => {
      tricksCircles.forEach((trickscirc) => {
        trickscirc.update();
        trickscirc.lookAt(mousepos);
      });
      
      
    });
    // End In View
  } else {
  }
});
// Snap Into View
$(".tricks-view").on("inview", function (event, isInView) {
  if (isInView) {
    $(".tricks-m-link").click();
  } else {
  }
});



const openModals = document.querySelectorAll('.openModal');
openModals.forEach(function(openModal) {
    openModal.addEventListener('click', function() {
        document.getElementById('myModal').style.display = 'block';
    });
});

// document.getElementById('openModal').addEventListener('click', function() {
//     document.getElementById('myModal').style.display = 'block';
// });

// window.onclick = function(event) {
//     if (event.target == document.getElementById('myModal')) {
//         document.getElementById('myModal').style.display = 'none';
//     }
// }

var span = document.getElementsByClassName("close")[0];

if (span) {
    span.onclick = function() {
        document.getElementById('myModal').style.display = 'none';
    }
}

// //======================================================
// // add ref
// //======================================================
// // 获取所有带有 https 的 a 标签
// const httpsLinks = document.querySelectorAll('a[href^="https://"]');
// // 遍历所有带有 https 的 a 标签
// httpsLinks.forEach(link => {
//   // 在 href 属性的末尾添加 ?ref=123
//   const newHref = link.href + '?ref=3dvalentine';
//   // 更新 a 标签的 href 属性
//   link.href = newHref;
// });

