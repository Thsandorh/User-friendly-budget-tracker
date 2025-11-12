package com.budgettracker.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

@CapacitorPlugin(name = "BudgetWidget")
public class BudgetWidgetPlugin extends Plugin {

    @PluginMethod
    public void updateWidget(PluginCall call) {
        Double dailyLimit = call.getDouble("dailyLimit", 5000.0);
        Double spentToday = call.getDouble("spentToday", 0.0);

        // Format current time
        SimpleDateFormat sdf = new SimpleDateFormat("HH:mm", new Locale("hu", "HU"));
        String lastUpdate = sdf.format(new Date());

        // Update widget data
        BudgetWidget.updateWidgetData(
                getContext(),
                dailyLimit,
                spentToday,
                lastUpdate
        );

        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("message", "Widget updated successfully");
        call.resolve(ret);
    }

    @PluginMethod
    public void isWidgetAdded(PluginCall call) {
        android.appwidget.AppWidgetManager appWidgetManager =
                android.appwidget.AppWidgetManager.getInstance(getContext());
        int[] ids = appWidgetManager.getAppWidgetIds(
                new android.content.ComponentName(getContext(), BudgetWidget.class)
        );

        JSObject ret = new JSObject();
        ret.put("added", ids.length > 0);
        ret.put("count", ids.length);
        call.resolve(ret);
    }
}
