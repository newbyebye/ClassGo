create database classgo CHARACTER SET 'utf8' COLLATE 'utf8_general_ci';

use classgo;

create table user (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username  varchar(32) NOT NULL,
    CONSTRAINT SYS_CT_66 UNIQUE(username),
    password  varchar(64),
    nickname  varchar(32),
    email     varchar(64),
    emailVerified BOOLEAN,
    sex        boolean,
    photo       varchar(256),
    fullname  varchar(32),
    studentNo  varchar(32),
    mobile     varchar(32),
    city      varchar(32),
    profession varchar(32),
    school     varchar(64),
    brief     varchar(256),
    openID    varchar(64),
    role     int,
    verify     int,
    createAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TRIGGER `update_user_trigger` BEFORE UPDATE ON `user`
 FOR EACH ROW SET NEW.`updateAt` = NOW();


create table accessToken (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    userId  BIGINT NOT NULL,
    ttl            int,
    ipAddr        varchar(32),
    token       varchar(128) NOT NULL,
    createAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt TIMESTAMP NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TRIGGER `update_accessToken_trigger` BEFORE UPDATE ON `accessToken`
 FOR EACH ROW SET NEW.`updateAt` = NOW();


create table post (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    title          varchar(128) NOT NULL,
    body        text,
    address     varchar(64),
    time        varchar(64),
    authorId    BIGINT NOT NULL,
    createAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt     TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TRIGGER `update_post_trigger` BEFORE UPDATE ON `post`
 FOR EACH ROW SET NEW.`updateAt` = NOW();

create table postUser (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    postId          BIGINT NOT NULL,
    userId    BIGINT NOT NULL,
    CONSTRAINT CST_postUser UNIQUE(postId, userId),
    isAssistant  boolean,
    createAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt     TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TRIGGER `update_postUser_trigger` BEFORE UPDATE ON `postUser`
 FOR EACH ROW SET NEW.`updateAt` = NOW();


create table tag (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    title          varchar(32) NOT NULL,
    createAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt     TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TRIGGER `update_tag_trigger` BEFORE UPDATE ON `tag`
 FOR EACH ROW SET NEW.`updateAt` = NOW();

create table postTag (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    postId          BIGINT NOT NULL,
    tagId    BIGINT NOT NULL,
    createAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt     TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TRIGGER `update_postTag_trigger` BEFORE UPDATE ON `postTag`
 FOR EACH ROW SET NEW.`updateAt` = NOW();

create table comment (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    postId          BIGINT NOT NULL,
    authorId    BIGINT NOT NULL,
    body        text,
    createAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt     TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TRIGGER `update_comment_trigger` BEFORE UPDATE ON `comment`
 FOR EACH ROW SET NEW.`updateAt` = NOW();

create table lesson (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    postId          BIGINT NOT NULL,
    status            numeric,
    starttime      DATETIME NOT NULL,
    timeout           numeric,
    lng             decimal(10, 7),
    lat             decimal(10, 7),
    createAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt       TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TRIGGER `update_lesson_trigger` BEFORE UPDATE ON `lesson`
 FOR EACH ROW SET NEW.`updateAt` = NOW();

create table sign (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    lessonId          BIGINT NOT NULL,
    userId            BIGINT NOT NULL,
    CONSTRAINT CST_sign UNIQUE(lessonId, userId),
    lng                decimal(10, 7),
    lat             decimal(10, 7),
    createAt         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt         TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TRIGGER `update_sign_trigger` BEFORE UPDATE ON `sign`
 FOR EACH ROW SET NEW.`updateAt` = NOW();

create table gameTemplate (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
         
    name           varchar(32) NOT NULL,
    type           int,
    subtype        int DEFAULT '0',
    subname        varchar(32),

    ruleLabel      text,

    var1Label       varchar(128),
    var1Help        varchar(128),
    var1Type        int,
    var1Range       varchar(32),
    var1Select      varchar(256),

    var2Label       varchar(128),
    var2Help        varchar(128),
    var2Type        int,
    var2Select      varchar(256),
    var2Range       varchar(32),

    createAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt       TIMESTAMP NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TRIGGER `update_game_template_trigger` BEFORE UPDATE ON `gameTemplate`
FOR EACH ROW SET NEW.`updateAt` = NOW();

-- 添加猜数字游戏
INSERT INTO gameTemplate(id, name, type, subtype,ruleLabel, var1Type, var1Help, var1Range) VALUES(0,'猜数字',1,0,'小于所有人平均数的70%的最大数获胜',1,'请输入0-100之间的整数', '[0-100]');
-- 添加最后通牒
INSERT INTO gameTemplate(id, name, type, subtype, subname, ruleLabel, var1Type, var1Help, var1Range) VALUES(0,'最后通牒',2,1,'提议者','现在有两人分100元，你作为提议者愿意拿出多少分给对方。如果对方接受你的方案，则按照该方案分配收益，如果对方不接收，双方收益都为0。',1,'请输入0-100之间的整数', '[0-100]');
INSERT INTO gameTemplate(id, name, type, subtype, subname, ruleLabel, var1Type, var1Help, var1Range) VALUES(0,'最后通牒',2,2,'接受者','现在有两人分100元，你作为接受者愿意接受对方给你多少收益。如果你接受对方的方案，则按照该方案分配收益，如果你不接收，双方收益都为0。',1,'请输入0-100之间的整数', '[0-100]');
INSERT INTO gameTemplate(id, name, type, subtype, subname, ruleLabel, var1Label, var1Type, var1Help, var1Range,var2Label, var2Type, var2Help, var2Range) VALUES(0,'最后通牒',2,3,'提议者和接受者','现在有两人分100元，你作为接受者和接受者分别愿意分给对方多少收益或接受对方分给你多少收益。','提议者','请输入0-100之间的整数', 1,'[0-100]','接受者',1,'请输入0-100之间的整数','[0-100]');
-- 强制性拍卖
INSERT INTO gameTemplate(id, name, type, subtype, subname, ruleLabel, var1Type, var1Help, var1Range) VALUES(0,'强制性拍卖',3,1,'出价高获胜','你将付出的成绩来拍卖这本书（价值25元），出价高的获胜',1,'请输入0-100之间的整数，未获胜者将在最终成绩中扣除该数', '[0-100]');
INSERT INTO gameTemplate(id, name, type, subtype, subname, ruleLabel, var1Type, var1Help, var1Range) VALUES(0,'强制性拍卖',3,2,'收益高获胜','你将付出的成绩来拍卖这本书（价值25元），收益高的获胜',1,'请输入0-100之间的整数，未获胜者将在最终成绩中扣除该数', '[0-100]');
-- 均衡多重性
INSERT INTO gameTemplate(id, name, type, subtype, subname, ruleLabel, var1Type, var1Help, var1Range) VALUES(0,'均衡多重性',4,1,'分钱游戏','随机抽取两人，数字相加为100即可获胜',1,'请输入0-100之间的整数', '[0-100]');
INSERT INTO gameTemplate(id, name, type, subtype, subname, ruleLabel, var1Type, var1Help, var1Range) VALUES(0,'均衡多重性',4,2,'数字游戏','随机抽取两人，数字相同即可获胜',1,'请输入0-100之间的整数', '[0-100]');
INSERT INTO gameTemplate(id, name, type, subtype, subname, ruleLabel, var1Type, var1Select, var1Range) VALUES(0,'均衡多重性',4,3,'地点游戏','随机抽取两人，地点相同即可获胜',3,'0:东九,1:西十二,2:主校区图书管,3:科技楼,4:青年园,5:醉晚亭,6:东校区图书馆,7:南一楼,8:韵苑大酒店,9:爱因斯坦广场', '[0-9]');
-- 多数派游戏
INSERT INTO gameTemplate(id, name, type, subtype, subname, ruleLabel, var1Type, var1Help, var1Range) VALUES(0,'多数派游戏',5,1,'数字游戏','填写出现次数最多数字的学生获胜',1,'请输入0-100之间的整数', '[0-100]');
INSERT INTO gameTemplate(id, name, type, subtype, subname, ruleLabel, var1Type, var1Select, var1Range) VALUES(0,'多数派游戏',5,2,'地点游戏','填写出现次数最多地点的学生获胜',3,'0:东九,1:西十二,2:主校区图书管,3:科技楼,4:青年园,5:醉晚亭,6:东校区图书馆,7:南一楼,8:韵苑大酒店,9:爱因斯坦广场', '[0-9]');
-- 少数派游戏
INSERT INTO gameTemplate(id, name, type, subtype, subname, ruleLabel, var1Type, var1Help, var1Range) VALUES(0,'少数派游戏',6,1,'数字游戏','填写出现次数最少数字的学生获胜',1,'请输入0-100之间的整数', '[0-100]');
INSERT INTO gameTemplate(id, name, type, subtype, subname, ruleLabel, var1Type, var1Select, var1Range) VALUES(0,'少数派游戏',6,2,'地点游戏','填写出现次数最少地点的学生获胜',3,'0:东九,1:西十二,2:主校区图书管,3:科技楼,4:青年园,5:醉晚亭,6:东校区图书馆,7:南一楼,8:韵苑大酒店,9:爱因斯坦广场', '[0-9]');


create table game (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    userId          BIGINT NOT NULL,
    postId          BIGINT NOT NULL,
    gameTemplateId  BIGINT NOT NULL,

    status         int,
    reward         int,
    gameTime       int,
    playerNum      int,
    showResult     boolean,

    createAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt       TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TRIGGER `update_game_trigger` BEFORE UPDATE ON `game`
FOR EACH ROW SET NEW.`updateAt` = NOW();

create table userGame (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    userId          BIGINT NOT NULL,
    gameId          BIGINT NOT NULL,

    var1         int,
    var2         int,
    isWin        boolean,

    createAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt       TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TRIGGER `update_user_game_trigger` BEFORE UPDATE ON `userGame`
FOR EACH ROW SET NEW.`updateAt` = NOW();




create view view_lesson_sign as
select sign.userId,sign.lng as signLng,sign.lat as signLat,sign.createAt as signAt, lesson.* from sign,lesson where sign.lessonId = lesson.id;


