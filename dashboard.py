import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import os
import json
from supabase import create_client, Client
from collections import Counter
from dotenv import load_dotenv

load_dotenv()

st.set_page_config(page_title="ChatGPT Scrapes Dashboard", layout="wide")

@st.cache_resource
def init_supabase():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key:
        st.error("Please set SUPABASE_URL and SUPABASE_KEY environment variables")
        st.stop()
    return create_client(url, key)

@st.cache_data
def get_customers():
    supabase = init_supabase()
    response = supabase.table("chatgpt_scrapes").select("customer").execute()
    customers = list(set([row["customer"] for row in response.data]))
    return sorted(customers)

@st.cache_data
def get_queries_for_customer(customer):
    supabase = init_supabase()
    response = supabase.table("chatgpt_scrapes").select("query").eq("customer", customer).execute()
    queries = list(set([row["query"] for row in response.data]))
    return sorted(queries)

@st.cache_data
def get_data_for_customer_query(customer, query):
    supabase = init_supabase()
    response = supabase.table("chatgpt_scrapes").select("*").eq("customer", customer).eq("query", query).execute()
    return pd.DataFrame(response.data)

def parse_json_column(df, column_name):
    parsed_data = []
    for item in df[column_name]:
        if item is None or (isinstance(item, float) and pd.isna(item)):
            parsed_data.append([])
        elif isinstance(item, list):
            parsed_data.append(item)
        else:
            try:
                parsed_data.append(json.loads(item))
            except:
                parsed_data.append([])
    return parsed_data

st.title("ChatGPT Scrapes Dashboard")

if 'authenticated' not in st.session_state:
    st.session_state.authenticated = False
    st.session_state.customer_name = None

if not st.session_state.authenticated:
    st.markdown("### 🔐 Customer Authentication")
    st.markdown("Please enter your customer name to access the dashboard:")
    
    customer_input = st.text_input("Customer Name:", placeholder="Enter your customer name...")
    
    if st.button("Access Dashboard", type="primary"):
        if customer_input:
            customers = get_customers()
            if customer_input in customers:
                st.session_state.authenticated = True
                st.session_state.customer_name = customer_input
                try:
                    st.rerun()
                except AttributeError:
                    st.experimental_rerun()
            else:
                st.error("Customer not found. Please check your customer name.")
        else:
            st.error("Please enter a customer name.")
    
    st.stop()

selected_customer = st.session_state.customer_name

col1, col2 = st.columns([3, 1])
with col1:
    st.markdown(f"### Welcome, {selected_customer}")
with col2:
    if st.button("Logout"):
        st.session_state.authenticated = False
        st.session_state.customer_name = None
        try:
            st.rerun()
        except AttributeError:
            st.experimental_rerun()

if selected_customer:
    queries = get_queries_for_customer(selected_customer)
    if not queries:
        st.error(f"No queries found for customer: {selected_customer}")
        st.stop()
    
    selected_query = st.selectbox("Select Query:", queries)
    
    if selected_query:
        df = get_data_for_customer_query(selected_customer, selected_query)
        
        if df.empty:
            st.error("No data found for the selected customer and query")
            st.stop()
        
        df['created_at'] = pd.to_datetime(df['created_at'])
        df['date'] = df['created_at'].dt.date
        
        past_month = pd.Timestamp.now(tz='UTC') - timedelta(days=30)
        df_past_month = df[df['created_at'] >= past_month]
        
        st.header("📊 Key Metrics (Past 30 Days)")
        
        col1, col2 = st.columns(2)
        
        with col1:
            customer_mentioned_pct = (df_past_month['customer_mentioned'].sum() / len(df_past_month) * 100) if len(df_past_month) > 0 else 0
            st.metric("Customer Mentioned", f"{customer_mentioned_pct:.1f}%")
        
        with col2:
            customer_top_ranked_pct = (df_past_month['customer_top_ranked'].sum() / len(df_past_month) * 100) if len(df_past_month) > 0 else 0
            st.metric("Customer Top Ranked", f"{customer_top_ranked_pct:.1f}%")
        
        st.header("📈 Trends Over Time")
        
        daily_stats = df.groupby('date').agg({
            'customer_mentioned': lambda x: (x.sum() / len(x) * 100),
            'customer_top_ranked': lambda x: (x.sum() / len(x) * 100)
        }).reset_index()
        
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=daily_stats['date'],
            y=daily_stats['customer_mentioned'],
            mode='lines+markers',
            name='Customer Mentioned %',
            line=dict(color='blue')
        ))
        fig.add_trace(go.Scatter(
            x=daily_stats['date'],
            y=daily_stats['customer_top_ranked'],
            mode='lines+markers',
            name='Customer Top Ranked %',
            line=dict(color='green')
        ))
        
        fig.update_layout(
            title='Customer Performance Over Time',
            xaxis_title='Date',
            yaxis_title='Percentage (%)',
            hovermode='x unified'
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        st.header("🔗 Top Cited Sources")
        
        col1, col2 = st.columns(2)
        with col1:
            start_date_sources = st.date_input("Start date for cited sources:", 
                                             value=df['created_at'].min().date(),
                                             min_value=df['created_at'].min().date(),
                                             max_value=df['created_at'].max().date())
        with col2:
            end_date_sources = st.date_input("End date for cited sources:", 
                                           value=df['created_at'].max().date(),
                                           min_value=df['created_at'].min().date(),
                                           max_value=df['created_at'].max().date())
        
        start_datetime_sources = pd.Timestamp(start_date_sources, tz='UTC')
        end_datetime_sources = pd.Timestamp(end_date_sources, tz='UTC') + pd.Timedelta(days=1)
        
        df_sources = df[(df['created_at'] >= start_datetime_sources) & (df['created_at'] < end_datetime_sources)]
        
        all_sources = []
        for sources_list in parse_json_column(df_sources, 'cited_sources'):
            all_sources.extend(sources_list)
        
        if all_sources:
            source_counts = Counter(all_sources)
            top_sources = source_counts.most_common(10)
            
            sources_df = pd.DataFrame(top_sources, columns=['Source', 'Count'])
            
            fig_sources = px.bar(
                sources_df, 
                x='Count', 
                y='Source',
                orientation='h',
                title=f'Top 10 Cited Sources ({start_date_sources} to {end_date_sources})'
            )
            fig_sources.update_layout(yaxis={'categoryorder': 'total ascending'})
            st.plotly_chart(fig_sources, use_container_width=True)
        else:
            st.info("No cited sources found for the selected time period")
        
        st.header("🏆 Top Candidates")
        
        col1, col2 = st.columns(2)
        with col1:
            start_date_candidates = st.date_input("Start date for candidates:", 
                                                value=df['created_at'].min().date(),
                                                min_value=df['created_at'].min().date(),
                                                max_value=df['created_at'].max().date())
        with col2:
            end_date_candidates = st.date_input("End date for candidates:", 
                                              value=df['created_at'].max().date(),
                                              min_value=df['created_at'].min().date(),
                                              max_value=df['created_at'].max().date())
        
        start_datetime_candidates = pd.Timestamp(start_date_candidates, tz='UTC')
        end_datetime_candidates = pd.Timestamp(end_date_candidates, tz='UTC') + pd.Timedelta(days=1)
        
        df_candidates = df[(df['created_at'] >= start_datetime_candidates) & (df['created_at'] < end_datetime_candidates)]
        
        all_candidates = []
        for candidates_list in parse_json_column(df_candidates, 'candidates'):
            all_candidates.extend(candidates_list)
        
        if all_candidates:
            candidate_counts = Counter(all_candidates)
            top_candidates = candidate_counts.most_common(10)
            
            candidates_df = pd.DataFrame(top_candidates, columns=['Candidate', 'Count'])
            
            fig_candidates = px.bar(
                candidates_df, 
                x='Count', 
                y='Candidate',
                orientation='h',
                title=f'Top 10 Candidates ({start_date_candidates} to {end_date_candidates})'
            )
            fig_candidates.update_layout(yaxis={'categoryorder': 'total ascending'})
            st.plotly_chart(fig_candidates, use_container_width=True)
        else:
            st.info("No candidates found for the selected time period")
        
        st.header("📋 Raw Data")
        with st.expander("View Raw Data"):
            st.dataframe(df)