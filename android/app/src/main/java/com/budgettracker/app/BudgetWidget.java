package com.budgettracker.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import java.text.NumberFormat;
import java.util.Locale;

/**
 * Implementation of App Widget functionality for Budget Tracker
 * Displays today's budget and spending on home screen
 */
public class BudgetWidget extends AppWidgetProvider {

    private static final String PREFS_NAME = "BudgetWidgetPrefs";
    private static final String PREF_DAILY_LIMIT = "dailyLimit";
    private static final String PREF_SPENT_TODAY = "spentToday";
    private static final String PREF_LAST_UPDATE = "lastUpdate";

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager,
                                int appWidgetId) {

        // Get saved data from SharedPreferences
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        double dailyLimit = prefs.getFloat(PREF_DAILY_LIMIT, 5000);
        double spentToday = prefs.getFloat(PREF_SPENT_TODAY, 0);
        String lastUpdate = prefs.getString(PREF_LAST_UPDATE, "");

        // Calculate remaining budget
        double remaining = dailyLimit - spentToday;
        int percentageUsed = (int) ((spentToday / dailyLimit) * 100);

        // Format numbers in Hungarian style
        NumberFormat currencyFormat = NumberFormat.getNumberInstance(new Locale("hu", "HU"));
        String dailyLimitText = currencyFormat.format(dailyLimit) + " Ft";
        String spentText = currencyFormat.format(spentToday) + " Ft";
        String remainingText = currencyFormat.format(remaining) + " Ft";

        // Construct the RemoteViews object
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_budget);

        // Update widget text
        views.setTextViewText(R.id.widget_title, "FinFlow");
        views.setTextViewText(R.id.widget_daily_limit, "Napi limit: " + dailyLimitText);
        views.setTextViewText(R.id.widget_spent, "Elköltve: " + spentText);
        views.setTextViewText(R.id.widget_remaining, remainingText);
        views.setTextViewText(R.id.widget_percentage, percentageUsed + "%");

        if (lastUpdate.length() > 0) {
            views.setTextViewText(R.id.widget_last_update, "Frissítve: " + lastUpdate);
        }

        // Set progress bar
        views.setProgressBar(R.id.widget_progress, 100, percentageUsed, false);

        // Set remaining text color based on budget status
        int textColor;
        if (remaining >= 0) {
            if (percentageUsed < 50) {
                textColor = 0xFF10B981; // Green
            } else if (percentageUsed < 80) {
                textColor = 0xFFFBBF24; // Yellow
            } else {
                textColor = 0xFFF97316; // Orange
            }
        } else {
            textColor = 0xFFEF4444; // Red - over budget
        }
        views.setTextColor(R.id.widget_remaining, textColor);

        // Create an intent to launch the app when widget is clicked
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_container, pendingIntent);

        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onEnabled(Context context) {
        // Enter relevant functionality for when the first widget is created
    }

    @Override
    public void onDisabled(Context context) {
        // Enter relevant functionality for when the last widget is disabled
    }

    /**
     * Method to update widget data from the app
     */
    public static void updateWidgetData(Context context, double dailyLimit, double spentToday, String lastUpdate) {
        SharedPreferences.Editor prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit();
        prefs.putFloat(PREF_DAILY_LIMIT, (float) dailyLimit);
        prefs.putFloat(PREF_SPENT_TODAY, (float) spentToday);
        prefs.putString(PREF_LAST_UPDATE, lastUpdate);
        prefs.apply();

        // Trigger widget update
        Intent intent = new Intent(context, BudgetWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] ids = AppWidgetManager.getInstance(context).getAppWidgetIds(
                new android.content.ComponentName(context, BudgetWidget.class));
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intent);
    }
}
