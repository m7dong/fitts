(function($) {
	$.accuracyMeasure = function(fromArg, toArg, widthArg, pathArg) {
		// accuracy measures (from MacKenzie, Silfverberg, & Kauppinen, 2001)
		// target re-entries, task axis crossings, movement direction change, orthogonal direction change
		// movement variability, movement error, movement offset
		var tre = 0, tac = 0, mdc = 0, odc = 0
		var mv = 0, me = 0, mo = 0

		var from = fromArg, to = toArg, targetWidth = widthArg, path = pathArg;
		var a = Math.hypot(to.x - from.x, to.y - from.y); // amplitude of trial (distance between from & to)
 		var transformedPath = transform(from, to, path);

		var THRESHOLD_TAC = 5, THRESHOLD_MDC = 10, THRESHOLD_ODC = 10;
		var thresholdTAC = 0, thresholdMDC = 0, thresholdODC = 0;
		var thresholdTACIsSet = false, thresholdMDCIsSet = false, thresholdODCIsSet = false;

		if (!thresholdTACIsSet)
			thresholdTAC = THRESHOLD_TAC;
		if (!thresholdMDCIsSet)
			thresholdMDC = THRESHOLD_MDC;
		if (!thresholdODCIsSet)
			thresholdODC = THRESHOLD_ODC;

		// -------------------------
		tre = 0;
		var radius = targetWidth;

		var pattern = "";
		for (i = 0; i < path.length; ++i) {
			var d = path[i].getDistance(to);
			if (d < radius)
				pattern = pattern + "1";
			else
				pattern = pattern + "0";
		}

		// smooth pattern (remove single- or double-runs of 0s or 1s)
		smooth(pattern);

		// count the target entries
		for (i = 0; i < pattern.length - 1; ++i) {
			if (pattern.charAt(i) == '0' && pattern.charAt(i + 1) == '1') // path has entered the
																			// target
				++tre;
		}

		--tre; // adjust (don't count first target entry)
		tre = tre < 0 ? 0 : tre;

		// -----------------------
		tac = 0;
		var belowAxis = false;
		var aboveAxis = false;
		for (i = 0; i < transformedPath.length; ++i) {
			// don't check for TAC if pointer is inside either target
			var d1 = Math.hypot(transformedPath[i].x, transformedPath[i].y); // distance from
			// 0,0
			var d2 = Math.hypot(a - transformedPath[i].x, transformedPath[i].y); // distance
			// from A,0
			if (d1 < radius || d2 < radius)
				continue;
			if (i == 0)
				continue; // just get bearings on first sample
			if (transformedPath[i-1].y > thresholdTAC)
				belowAxis = true;
			if (transformedPath[i-1].y < -thresholdTAC)
				aboveAxis = true;


			if (belowAxis && transformedPath[i].y < -thresholdTAC) {
				++tac;
				belowAxis = false;
				aboveAxis = true;
			}
			else if (aboveAxis && transformedPath[i].y > thresholdTAC) {
				++tac;
				belowAxis = true;
				aboveAxis = false;
			}
		}

		// -------------------
		mdc = 0;
		pattern = "";
		for (i = 0; i < transformedPath.length - 1; ++i) {
			// build a pattern showing direction changes from one point to the next
			if ((transformedPath[i + 1].y - transformedPath[i].y) >= 0)
				pattern = pattern + "1";
			else
				pattern = pattern + "0";
		}

		// smooth pattern (remove single- or double-runs of 0s or 1s)
		pattern = smooth(pattern);

		// only increment mdc if deltaY > threshold from one direction change to the next
		for (i = 1; i < pattern.length; ++i) {
			var firstIdx = i - 1;
			while (i < pattern.length && pattern.charAt(i) == pattern.charAt(i - 1))
				++i;
			var secondIdx = i;
			if (secondIdx < pattern.length - 1
					&& Math.abs(transformedPath[firstIdx].y - transformedPath[secondIdx].y) > thresholdMDC)
				++mdc;
		}

		// ------------------
		odc = 0;
		pattern = "";
		for (i = 0; i < transformedPath.length - 1; ++i)
		{
			// stop checking once the cursor enters the target
			// double d = Math.hypot(a - transformedPath[i].x, transformedPath[i].y); // distance
			// from A,0
			// if (d < radius)
			// break;

			if ((transformedPath[i + 1].x - transformedPath[i].x) >= 0)
				pattern = pattern + "1";
			else
				pattern = pattern + "0";
		}

		// smooth pattern (remove single- or double-runs of 0s or 1s)
		pattern = smooth(pattern);

		// only increment odc if deltaX > threshold from one direction change to the next
		for (i = 1; i < pattern.length; ++i) {
			var firstIdx = i - 1;
			while (i < pattern.length && pattern.charAt(i) == pattern.charAt(i - 1))
				++i;
			var secondIdx = i;
			// System.out.printf("i1=%d, i2=%d, y1=%.1f, y2=%.1f\n", firstIdx, secondIdx,
			// transformedPath[firstIdx].y,
			// transformedPath[secondIdx].y);

			if (secondIdx < pattern.length - 1
					&& Math.abs(transformedPath[firstIdx].x - transformedPath[secondIdx].x) > thresholdODC)
				++odc;
		}

		// ----------------------
		mv = me = mo = 0.0;
		var yy = [];
		for (i = 0; i < transformedPath.length; ++i)
			yy.push(transformedPath[i].y);
		var meanY = mean(yy);
		for (i = 0; i < transformedPath.length; ++i) {
			mv += (transformedPath[i].y - meanY) * (transformedPath[i].y - meanY);
			me += Math.abs(transformedPath[i].y);
		}
		mv = Math.sqrt(mv / (transformedPath.length - 1));
		me = me / transformedPath.length;
		mo = meanY;

		return [tre, tac, mdc, odc, mv, me, mo];
	}

	/*
	 * Return a transformed array of points, such that "from" is (0,0) and "to" is (x,0), where x is
	 * the specified movement amplitude for the trial. In other words, we are transforming the path
	 * such that the trial begins at the origin and moves horizontally to the right. This
	 * facilitates computing the accuracy measures.
	 */
	function transform(from, to, p) {
		var tp = [];

		var xTranslate = from.x;
		var yTranslate = from.y;
		for (i = 0; i < p.length; ++i)
			tp[i] = new Point((p[i].x - xTranslate), (p[i].y - yTranslate));

		var xDelta = to.x - from.x;
		var yDelta = to.y - from.y;
		var theta = Math.atan(yDelta / xDelta);
		theta = (2.0 * Math.PI) - theta;

		for (i = 0; i < tp.length; ++i) {
			var xx = tp[i].x;
			var yy = tp[i].y;
			tp[i].x = -(xx * Math.cos(theta) - yy * Math.sin(theta));
			tp[i].y = (xx * Math.sin(theta) + yy * Math.cos(theta));
		}
		return tp;
	}

	function smooth(patternString) {
		// smooth the pattern (1st pass)
		for (i = 0; i < patternString.length - 3; ++i) {
			if (patternString.substring(i, i + 3) == ("101")) {
				patternString = patternString.substr(0, i) + '111' + patternString.substr(i+3);
			}

			else if (patternString.substring(i, i + 3) == ("010"))
				patternString = patternString.substr(0, i) + '000' + patternString.substr(i+3);
		}

		// smooth the pattern (2nd pass)
		for (i = 0; i < patternString.length - 4; ++i) {
			if (patternString.substring(i, i + 4) == ("1001"))
				patternString = patternString.substr(0, i) + '1111' + patternString.substr(i+4);
			else if (patternString.substring(i, i + 4) == ("0110"))
				patternString = patternString.substr(0, i) + '0000' + patternString.substr(i+4);
		}

		return patternString;
	}

	function mean(valueArray) {
		var mean = 0.0;
		for (j = 0; j < valueArray.length; j++) {
			mean += valueArray[j];
		}
		return mean / valueArray.length;
	}


})(jQuery);
