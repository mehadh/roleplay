-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 10, 2022 at 11:22 PM
-- Server version: 10.1.21-MariaDB
-- PHP Version: 5.6.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rp`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `ID` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(60) NOT NULL,
  `email` varchar(150) NOT NULL,
  `slots` tinyint(4) NOT NULL DEFAULT '3',
  `admin` int(11) NOT NULL DEFAULT '0',
  `nMute` tinyint(1) NOT NULL DEFAULT '0',
  `registerDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastActive` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `socialClub` varchar(20) NOT NULL,
  `socialClubId` int(11) NOT NULL,
  `position` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `accounts`
--

INSERT INTO `accounts` (`ID`, `username`, `password`, `email`, `slots`, `admin`, `nMute`, `registerDate`, `lastActive`, `socialClub`, `socialClubId`, `position`) VALUES
(1, 'mehad', '$2a$10$vQXJt6NNd39A8jy3pMzcxOeoyGYhxg6/bd19zIjj6P1v1x6LFrOxK', 'mehad@mehad.mehad', 3, 2, 0, '2021-08-04 11:45:09', '2022-01-10 17:19:48', 'kylethegamerhd', 1926792499, '{\"x\":-1411.260498046875,\"y\":-687.9657592773438,\"z\":126.98267364501953}'),
(2, 'shareef', '$2a$10$UzObNieXHxC3cn9OnOQdtu8p8V11Tmj9aMq4RiVIFJSPq3isQ82zy', 'shareefo@shareefo.shareefo', 3, 0, 0, '2021-08-14 15:39:07', '2021-08-14 22:52:40', 'kylethegamerhd', 192679249, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `business`
--

CREATE TABLE `business` (
  `bizId` int(11) NOT NULL,
  `ownerId` int(11) NOT NULL DEFAULT '0',
  `bizType` tinyint(4) NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `position` text NOT NULL,
  `hasInt` tinyint(1) NOT NULL DEFAULT '0',
  `intData` mediumtext,
  `stockType` tinyint(4) NOT NULL DEFAULT '0',
  `stock` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `characters`
--

CREATE TABLE `characters` (
  `charId` int(11) NOT NULL,
  `accId` int(11) NOT NULL,
  `first` text NOT NULL,
  `last` text NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `position` text,
  `cash` int(11) NOT NULL DEFAULT '500',
  `bank` int(11) NOT NULL DEFAULT '1000',
  `paycheck` int(11) NOT NULL DEFAULT '0',
  `payTime` tinyint(4) NOT NULL DEFAULT '0',
  `paycheckAmt` mediumint(9) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `characters`
--

INSERT INTO `characters` (`charId`, `accId`, `first`, `last`, `active`, `position`, `cash`, `bank`, `paycheck`, `payTime`, `paycheckAmt`) VALUES
(1, 1, 'Mehad', 'Hamad', 1, '{\"x\":-3013.10009765625,\"y\":1483.0225830078125,\"z\":27.000009536743164}', 49, 26530, 2000, 40, 21),
(2, 1, 'Not', 'Mehad', 1, '{\"x\":-949.4813232421875,\"y\":-1484.4449462890625,\"z\":1.5867055654525757}', 0, 0, 0, 0, 0),
(3, 2, 'Some', 'Guy', 1, NULL, 0, 40, 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `record`
--

CREATE TABLE `record` (
  `recordId` int(11) NOT NULL,
  `accId` int(11) NOT NULL,
  `type` text NOT NULL,
  `issued` text NOT NULL,
  `issuer` int(11) NOT NULL,
  `reason` text NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '0',
  `hours` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `record`
--

INSERT INTO `record` (`recordId`, `accId`, `type`, `issued`, `issuer`, `reason`, `active`, `hours`) VALUES
(1, 1, 'kick', '1628554062000', 1, 'something', 0, NULL),
(2, 1, 'kick', '1628554148000', 1, 'something', 0, NULL),
(3, 1, 'kick', '1628554301000', 1, 'something', 0, NULL),
(4, 1, 'kick', '1628554990000', 1, 'something', 0, NULL),
(5, 1, 'ban', '1628554995000', 1, 'something', 0, 1),
(6, 1, 'pban', '1628555005000', 1, 'something', 0, NULL),
(7, 1, 'kick', '1628638962000', 1, 'being a bad guy', 0, NULL),
(8, 1, 'kick', '1628638970000', 1, 'being an afk guy', 0, NULL),
(9, 1, 'kick', '1628639111000', 1, 'again he be bad guy', 0, NULL),
(10, 1, 'kick', '1628639120000', 1, 'and again he be afk guy', 0, NULL),
(11, 1, 'warn', '1628642303000', 1, 'guy', 0, NULL),
(12, 1, 'warn', '1628642341000', 1, 'no', 0, NULL),
(13, 1, 'warn', '1628642344000', 1, 'yes', 0, NULL),
(14, 2, 'ban', '1629001968000', 1, 'i dont know why to be honest', 0, 2),
(15, 2, 'ban', '1629002024000', 1, 'i dont know why to be honest', 0, 2),
(22, 2, 'pban', '1629002503000', 1, 'i dont like him', 0, NULL),
(23, 1, 'pban', '1629002530000', 1, 'also am i dont like him', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `transfers`
--

CREATE TABLE `transfers` (
  `transferId` int(11) NOT NULL,
  `sender` int(11) NOT NULL,
  `receiver` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `reason` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `transfers`
--

INSERT INTO `transfers` (`transferId`, `sender`, `receiver`, `amount`, `reason`) VALUES
(1, 3, 3, 10, 'Reason'),
(2, 1, 3, 20, 'a reason that is more than one word');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `vehId` int(11) NOT NULL,
  `model` text NOT NULL,
  `charId` int(11) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `position` text,
  `rotation` int(11) DEFAULT NULL,
  `fuel` tinyint(4) NOT NULL DEFAULT '100',
  `mileage` mediumint(9) NOT NULL DEFAULT '0',
  `primaryColor` smallint(6) NOT NULL,
  `secondaryColor` smallint(6) NOT NULL,
  `numberPlate` text NOT NULL,
  `mods` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`vehId`, `model`, `charId`, `active`, `position`, `rotation`, `fuel`, `mileage`, `primaryColor`, `secondaryColor`, `numberPlate`, `mods`) VALUES
(1, 'pariah', 1, 1, '{\"x\":-963.4083251953125,\"y\":-1496.5792236328125,\"z\":4.417212963104248}', -140, 100, 0, 0, 0, 'P', '{\"53 \":5,\"11 \":3,\"12 \":2,\"13 \":2,\"15 \":2,\"48 \":2,\"1 \":5,\"3 \":1,\"14 \":44}');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `business`
--
ALTER TABLE `business`
  ADD PRIMARY KEY (`bizId`);

--
-- Indexes for table `characters`
--
ALTER TABLE `characters`
  ADD PRIMARY KEY (`charId`),
  ADD KEY `accID` (`accId`);

--
-- Indexes for table `record`
--
ALTER TABLE `record`
  ADD PRIMARY KEY (`recordId`),
  ADD KEY `accId` (`accId`);

--
-- Indexes for table `transfers`
--
ALTER TABLE `transfers`
  ADD PRIMARY KEY (`transferId`),
  ADD KEY `sender` (`sender`),
  ADD KEY `receiver` (`receiver`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`vehId`),
  ADD KEY `charId` (`charId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts`
--
ALTER TABLE `accounts`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `business`
--
ALTER TABLE `business`
  MODIFY `bizId` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `characters`
--
ALTER TABLE `characters`
  MODIFY `charId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `record`
--
ALTER TABLE `record`
  MODIFY `recordId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;
--
-- AUTO_INCREMENT for table `transfers`
--
ALTER TABLE `transfers`
  MODIFY `transferId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `vehId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `characters`
--
ALTER TABLE `characters`
  ADD CONSTRAINT `characters_ibfk_1` FOREIGN KEY (`accID`) REFERENCES `accounts` (`ID`);

--
-- Constraints for table `record`
--
ALTER TABLE `record`
  ADD CONSTRAINT `record_ibfk_1` FOREIGN KEY (`accId`) REFERENCES `accounts` (`ID`);

--
-- Constraints for table `transfers`
--
ALTER TABLE `transfers`
  ADD CONSTRAINT `transfers_ibfk_1` FOREIGN KEY (`sender`) REFERENCES `characters` (`charId`),
  ADD CONSTRAINT `transfers_ibfk_2` FOREIGN KEY (`receiver`) REFERENCES `characters` (`charId`);

--
-- Constraints for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `charId` FOREIGN KEY (`charId`) REFERENCES `characters` (`charId`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
