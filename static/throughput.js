(function($) {
    $.throughput = function(fromSeq, toSeq, selectSeq, widthArg, mt, amplitude) {
        var log_two = 0.693147181, sqrt_2_pi_e = 4.132731354;
        // int constants for response type
        var serial = 100, discrete = 101;
        // int constants for tasks type
        var one_dimensional = 200, two_dimensional = 201;

        var amplitude = amplitude, width = widthArg;
        var from = fromSeq, to = toSeq, select = selectSeq, mt = mt;
        var numberOfTrials = mt.length, responseType = 100, taskType = 201;
        var serialTask = responseType == 100 ? true : false;

        var deltaX = [], ae = [], miss = [];

        for (i = 0; i < to.length; ++i) {
            deltaX[i] = getTrialDeltaX(from[i], to[i], select[i]);
            ae[i] = getTrialAe(from[i], to[i], select[i]);
			if (serialTask && i > 0) {
                ae[i] += deltaX[i - 1];
            }
            var distanceToCenter = Math.hypot(select[i].x - to[i].x, select[i].y - to[i].y);
            if (taskType == one_dimensional) {
                miss[i] = Math.abs(deltaX[i]) > width / 2.0 ? 1 : 0;
            }
            else if (taskType == two_dimensional) {
                miss[i] = distanceToCenter > width / 2.0 ? 1 : 0;
            }
            else {
                miss[i] = -1;
            }
        }

        var difficultyID = getID(amplitude, width, log_two), Ae = getAe(ae),
            We = getWe(deltaX, sqrt_2_pi_e), IDe = getIDe(ae, deltaX, log_two, sqrt_2_pi_e),
            mt = getMT(mt);
        var skewness = getSkewness(deltaX), kurtosis = getKurtosis(deltaX);
        var meanX = getMeanX(deltaX), miss = getMisses(numberOfTrials, miss),
            errorRate = getErrorRate(numberOfTrials, miss),
            throughput = getThroughput(ae, deltaX, log_two, sqrt_2_pi_e, mt)
        result = [taskType, responseType, amplitude, width, difficultyID, numberOfTrials,
                  skewness, kurtosis, Ae, We, IDe, mt, meanX, miss, errorRate,
                  throughput];

        return result;
    }

    // the distance from the selection coordinate to the target center, as projected on the task axis.
	function getTrialDeltaX(from, to, select) {
		// start-of-trial coordinate (centre of the "from" target)
		var x1 = from.x;
		var y1 = from.y;

		// centre coordinate of the target to select (center of the "to" target)
		var x2 = to.x;
		var y2 = to.y;

		// actual selection coordinate ("select")
		var x = select.x;
		var y = select.y;

		// compute length of the sides of the triangle formed by the three points above
		var a = Math.hypot(x1 - x2, y1 - y2); // a is the specified amplitude
		var b = Math.hypot(x - x2, y - y2); // b is the distance from the selection point to the
												// target center
		var c = Math.hypot(x1 - x, y1 - y);
		return (c * c - b * b - a * a) / (2.0 * a);
	}

	// A (the distance between the "from" and "to" points) plus deltaX. See as well, getTrialDeltaX.
	function getTrialAe(from, to, select) {
		var a = Math.hypot(to.x - from.x, to.y - from.y);
		var dx = getTrialDeltaX(from, to, select);
		return a + dx;
	}

    function calcAmplitude(amplitude, a, trialIndex, taskType, numberOfTrials) {
        var wiggle = 2.0, taskAdjustedAmplitude = -1.0;

        if (taskType == 201) {
            // even number of trials (taskAdjustedAmplitude is different for even- and odd-numbered
			// trials)
			if (numberOfTrials % 2 == 0)
				if (trialIndex % 2 == 0) // even-indexed trials
					taskAdjustedAmplitude = amplitude;
				else
				// odd-indexed trials
				{
					var b = amplitude * Math.sin(Math.PI / numberOfTrials);
					var theta = 0.5 * Math.PI * (numberOfTrials - 2) / numberOfTrials;
					var c = b * Math.sin(theta);
					var x = b * Math.cos(theta);
					taskAdjustedAmplitude = Math.sqrt((amplitude - x) * (amplitude - x) + c * c);
				}
			else
			// odd number of trials (taskAdjustedAmplitude is the same for every trial in the
			// sequence)
			{
				var b = amplitude * Math.sin(Math.PI / numberOfTrials);
				var m = 2.0 * numberOfTrials;
				var theta = 0.5 * ((Math.PI * (m - 2.0)) / m);
				var x = (b / 2.0) / Math.tan(theta);
				var h = amplitude - x;
				taskAdjustedAmplitude = Math.sqrt(h * h + (b / 2.0) * (b / 2.0));
			}
        }
        else if (taskType == 200) {
            taskAdjustedAmplitude = amplitude; // the 1D case is simple (but still worth checking)
        }

        if (Math.abs(a - taskAdjustedAmplitude) > wiggle) {
            amplitude = taskAdjustedAmplitude;
        }

        return amplitude
    }

    /**
	 * Returns the specified index of difficulty for this sequence of trials. The specified index of
	 * difficulty is ID = log2(A/W + 1). This value is not used in calculating Throughput.
     It is provided only as a convenience.
	 */
	function getID(amplitude, width, log_two) {
		return Math.log(amplitude / width + 1) / log_two;
	}

    /**
	 * Returns the skewness in the specified array of doubles.
	 */
	function getSkewness(d) {
		var m = mean(d);
		var sd = sde(d);
		var skew = 0.0;
		var n = d.length;
		var factor = n / ((n - 1.0) * (n - 2.0));
		for (i = 0; i < d.length; ++i)
			skew += Math.pow((d[i] - m) / sd, 3.0);
		skew *= factor;
		return skew;
	}

    /**
	 * Returns the kurtosis in the specified array of doubles.
	 */
	function getKurtosis(d) {
		var m = mean(d);
		var sd = sde(d);
		var kur = 0.0;
		var n = d.length;
		var factor1 = (n * (n + 1.0)) / ((n - 1.0) * (n - 2.0) * (n - 3.0));
		var factor2 = (3.0 * (n - 1.0) * (n - 1.0)) / ((n - 2.0) * (n - 3.0));
		for (i = 0; i < d.length; ++i)
			kur += Math.pow((d[i] - m) / sd, 4.0);
		kur = factor1 * kur - factor2;
		return kur;
	}

    /**
	 * Returns a boolean holding the result of a Lilliefors test for normality. The test is done at
	 * an alpha of 0.05. The null hypothesis is that the selection coordinates in this sequence of
	 * trials, as projected on the task axis, are normally distributed. If true is returned, the
	 * null hypothesis is retained (not rejected). If false is returned, the null hypothesis is
	 * rejected.

	function getIsNormal() {
		return Lilliefors.isNormal(deltaX);
	}
    */

    /**
     * Returns the effective amplitude for the trials in this sequence. The effective amplitude is
     * the mean of the actual movement amplitudes for the sequence of trials, as projected on the
     * task axis.
     */
    function getAe(ae) {
        return mean(ae);
    }

    /**
	 * Returns the effective target width for this sequence of trials. The effective target width is
	 * 4.133 x SDx, where SDx is the standard deviation in the selection coordinates, as projected
	 * onto the task axis.
	 */
	function getWe(deltaX, sqrt_2_pi_e) {
		return sqrt_2_pi_e * getSDx(deltaX);
	}

    /**
	 * Returns the standard deviation in the selection coordinates for this sequence of trials. The
	 * coordinates are projected onto the task axis.
	 */
	function getSDx(deltaX) {
		return sde(deltaX);
	}

    /**
	 * Returns the effective index of difficulty for this sequence of trials. The effective index of
	 * difficulty, IDe = log2(Ae/We + 1).
	 */
	function getIDe(ae, deltaX, log_two, sqrt_2_pi_e) {
		return Math.log(getAe(ae) / (sqrt_2_pi_e * getSDx(deltaX)) + 1.0) / log_two;
	}

    /**
	 * Returns the mean movement time (ms) for the sequence of trials.
	 */
	function getMT(mt) {
		return mean(mt); // milliseconds
	}

    /**
	 * Returns the mean of the selection coordinates for this sequence of trials. The coordinates
	 * are projected onto the task axis.
	 */
	function getMeanX(deltaX) {
		return mean(deltaX);
	}

    /**
	 * Returns the number of misses for this sequence.
	 */
	function getMisses(numberOfTrials, miss) {
		var count = 0;
		for (i = 0; i < numberOfTrials; ++i)
			count += miss[i];
		return count;
	}

    /**
	 * Returns the error rate as a percentage.
	 */
	function getErrorRate(numberOfTrials, miss) {
		return getMisses(numberOfTrials, miss) / numberOfTrials * 100.0;
	}

    /**
	 * Returns the Throughput for the sequence of trials.
	 */
	function getThroughput(ae, deltaX, log_two, sqrt_2_pi_e, mt) {
		var aeMean = mean(ae);
		var sdx = sde(deltaX);
		var we = sqrt_2_pi_e * sdx;
		var ide = Math.log(aeMean / we + 1.0) / log_two; // bits
		var mtMean = mean(mt) / 1000.0; // seconds
		return ide / mtMean; // bits per second
	}

    /**
	 * Calculate the mean of the values in a double array.
	 */
	function mean(n) {
		var mean = 0.0;
		for (j = 0; j < n.length; j++)
			mean += n[j];
		return mean / n.length;
	}

	/**
	 * Calculate the standard deviation of values in a double array.
	 */
	function sde(n) {
		var m = mean(n);
		var t = 0.0;
		for (j = 0; j < n.length; j++)
			t += (m - n[j]) * (m - n[j]);
		return Math.sqrt(t / (n.length - 1.0));
	}

})(jQuery);
